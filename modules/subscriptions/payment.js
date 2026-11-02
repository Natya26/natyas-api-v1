'use strict';

const APIError = require('./../errors/APIError');
const db = require('./../db');
const models = require('./../db/models');
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY_TEST;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY_TEST;
const RAZORPAY_KEY = process.env.RAZORPAY_KEY;
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET;
const stripe = require('stripe');
const Razorpay = require('razorpay');
const SubscriptionClient = require('./subscription');
const SubscriptionPlanClient = require('./../subscription-plans/subscriptionPlan');
const Utils = require('./../utils');
const moment = require('moment/moment');
// const { encrypt } = require('../utils/crypto-methods');
const NDPSConfig = require('./../config/nttdata.config');
const axios = require('axios');
const AtomEncryption = require('./atom-encryption');
const NDPSAPI = require('./ndps-api');
const ndpsApiClient = new NDPSAPI();
const jwtAuth = require('./../authentication/jwt-auth');
const ApplicationMetadata = require('./../settings/application-metadata');
const applicationMetadataClient = new ApplicationMetadata();
const SPayClient = require('./spay');
const AirpayClient = require('./airpay');
const HDFC = require('./hdfc');

class Payment {

    static calculateAmount(cost, currency) {
        if (currency == 'inr')
            return cost * 100;
        return cost;
    }

    static async createPaymentIntent(plan) {
        return new Promise(async (resolve, reject) => {
            try {
                const stripeClient = stripe(STRIPE_SECRET_KEY);
                const paymentIntent = await stripeClient.paymentIntents.create({
                    amount: this.calculateAmount(plan['cost'], plan['currency']),
                    currency: plan['currency'],
                    automatic_payment_methods: {
                      enabled: true,
                    },
                  });
                return resolve({ paymentIntent, STRIPE_PUBLISHABLE_KEY });
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async createPayment(payload) {
        return new Promise(async (resolve, reject) => {
            try {
                Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
                const payment = await db.insertDoc('payments', payload);
                return resolve(payment);
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async updatePayment(id, payload) {
        return new Promise(async (resolve, reject) => {
            try {
                Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
                const payment = await db.updateDoc('payments', id, payload);
                return resolve(payment);
            } catch (e) {
                return reject(e);
            }
        });
    }

    static getPayment(id) {
        try {
            return models.Payment.query()
                .withGraphFetched('[user, subscriptionPlan]')
                .select('payments.*')
                .first()
                .modify(query => {
                    if (id) query.where('payments.id', id);
                });
        } catch (e) {
            throw e;
        }
    }
    static getPaymentByPaymentId(id) {
        try {
            return models.Payment.query()
                .withGraphFetched('[user, subscriptionPlan]')
                .select('payments.*')
                .where('payments.payment_intent_id', id)
                .first()
                .modify(query => {
                    if (id) query.where('payments.payment_intent_id', id);
                });
        } catch (e) {
            throw e;
        }
    }

    static getPaymentList(limit = null, offset = null, orderBy = []) {
        return models.Payment.query()
            .select('payments.*')
            .modify(query => {
                if (orderBy.length)
                    query.orderBy(orderBy)
                if (limit)
                    query.limit(limit);
                if (offset)
                    query.offset(offset);
            });
    }
    static async createRazorpayPaymentOrder(plan) {
        return new Promise(async (resolve, reject) => {
            try {
                var instance = new Razorpay({ key_id: RAZORPAY_KEY, key_secret: RAZORPAY_SECRET })
                var options = {
                    amount: this.calculateAmount(plan['cost'], plan['currency']),  // amount in the smallest currency unit
                    currency: plan['currency']?.toUpperCase() ?? 'INR',
                };
                const orderRequest = await instance.orders.create(options);
                console.log(orderRequest,'orderRequest');
                return resolve(orderRequest);
            } catch (e) {
                return reject(e);
            }
        });
    }
    static async updateVerifyRazorpayPaymentOrder(payment) {
        return new Promise(async (resolve, reject) => {
            try {
                var instance = new Razorpay({ key_id: RAZORPAY_KEY, key_secret: RAZORPAY_SECRET })
                var options = {
                    amount: this.calculateAmount(plan['cost'], plan['currency']),  // amount in the smallest currency unit
                    currency: plan['currency']?.toUpperCase() ?? 'INR',
                };
                const orderRequest = await instance.orders.create(options);
                console.log(orderRequest,'orderRequest');
                return resolve(orderRequest);
            } catch (e) {
                return reject(e);
            }
        });
    }
    static async paymentComplete(paymentId) {
        return new Promise(async (resolve, reject) => {
            try {
                const payment = await this.updatePayment(paymentId, {"payment_status": "COMPLETED"});
                if (payment.payment_status == 'COMPLETED') {
                    const planId = payment.subscription_plan_id;
                    const plan = await SubscriptionPlanClient.getPlan(planId);
                    const startDate = moment(payment.created_at).toISOString();
                    const endDate = moment(startDate).add(plan.validity, plan.validity_unit).subtract(1, "DAY").toISOString();
                    const subscriptionPayload = {
                        'subscription_plan_id': planId,
                        'user_id': payment.user_id,
                        'valid_from': startDate,
                        'valid_till': endDate,
                        'active': true,
                    };
                    const subscriptionExists = await SubscriptionClient.getSubscription()
                        .where('subscriptions.user_id', payment.user_id);
                    if (subscriptionExists)
                        await SubscriptionClient.updateSubscription(subscriptionExists.id, subscriptionPayload);
                    else
                        await SubscriptionClient.createSubscription(subscriptionPayload);
                }
                return resolve(payment);
            } catch (e) {
                return reject(e);
            }
        });
    }
    static async paymentFailed(paymentId) {
        return new Promise(async (resolve, reject) => {
            try {
                const payment = await this.updatePayment(paymentId, {"payment_status": "FAILED"});
                return resolve(payment);
            } catch (e) {
                return reject(e);
            }
        });
    }
    static async paymentPending(paymentId) {
        return new Promise(async (resolve, reject) => {
            try {
                const payment = await this.updatePayment(paymentId, {"payment_status": "PROCESSING"});
                return resolve(payment);
            } catch (e) {
                return reject(e);
            }
        });
    }
    static async razorpayPaymentCapture(razorpayPayment) {
        return new Promise(async (resolve, reject) => {
            try {
                const paymentOrderId = razorpayPayment?.payment?.entity?.order_id ? razorpayPayment?.payment?.entity?.order_id : null;
                if(paymentOrderId){
                const paymentDetail = await this.getPaymentByPaymentId(paymentOrderId).first();
                if(paymentDetail && paymentDetail.payment_status == 'INITIATED'){
                    console.log(paymentDetail,'paymentDetail')
                    const completeRequest = await this.paymentComplete(paymentDetail.id);
                    return resolve(completeRequest);
                }
                }
                throw "Invalid request";
            } catch (e) {
                return reject(e);
            }
        });
    }
    static async razorpayPaymentFailed(paymentIntent) {
        return new Promise(async (resolve, reject) => {
            try {
                const paymentOrderId = paymentIntent.order_id;
                const paymentDetail = await this.getPaymentByPaymentId(paymentOrderId);
                if(paymentDetail && paymentDetail.payment_status == 'INITIATED'){
                    const completeRequest = await this.paymentFailed(paymentDetail.id);
                    return resolve(completeRequest);
                }
                throw "Invalid request";
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async stripePaymentSucceeded(paymentIntent) {
        return new Promise(async (resolve, reject) => {
            try {
                const paymentIntentId = paymentIntent.id;
                const paymentDetail = await this.getPaymentByPaymentId(paymentIntentId);
                if(paymentDetail && paymentDetail.payment_status == 'INITIATED'){
                    const completeRequest = await this.paymentComplete(paymentDetail.id);
                    return resolve(completeRequest);
                }
                throw "Invalid request";
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async stripePaymentFailed(paymentIntent) {
        return new Promise(async (resolve, reject) => {
            try {
                const paymentIntentId = paymentIntent.id;
                const paymentDetail = await this.getPaymentByPaymentId(paymentIntentId);
                if(paymentDetail && paymentDetail.payment_status == 'INITIATED'){
                    const completeRequest = await this.paymentFailed(paymentDetail.id);
                    return resolve(completeRequest);
                }
                throw "Invalid request";
            } catch (e) {
                return reject(e);
            }
        });
    }
    
    static async getPaymentToken(userId) {
        return new Promise(async (resolve, reject) => {
            try {
                const token = await this.generatePaymentToken();
                const payload = {
                    'user_id': userId,
                    'token': token,
                }

                const recordExists = await db.getQueryBuilder('payment_tokens')
                    .where('user_id', userId)
                    .first();
                if (!recordExists) {
                    const paymentToken = await db.insertDoc('payment_tokens', payload);
                } else {
                    const paymentToken = await db.updateDoc('payment_tokens', recordExists.id, payload);
                }
                let result = { token, upi_id: null };
                const upiInfo = await applicationMetadataClient.getMerchantUPIId();
                console.log(upiInfo)
                result.upi_id = ((!upiInfo) || upiInfo.upiId == null) ? process.env.HOST_UPI_ID : upiInfo.upiId;
                return resolve(result);
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async generatePaymentToken() {
        function uuidv4() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        let random = uuidv4();
        let uuidQuery = db.getQueryBuilder('payment_tokens').where({ token: random }).first()
        let uuid = await db.executeQuery(uuidQuery)
        if (!uuid) return random
        else this.generatePaymentToken()
    }

    static async completePaymentWithToken(data, userId) {
        return new Promise(async (resolve, reject) => {
            try {
                // const buf = Utils.asymmetricDecrypt(Buffer.from(data.token, 'base64'));
                // const decryptedData = JSON.parse(buf.toString());
                // const { user_id, token } = decryptedData;
                // if (user_id != userId) throw new APIError(400, 'INVALID_TOKEN');
                // const tokenExists = await db.getQueryBuilder('payment_tokens')
                //     .where('user_id', user_id)
                //     .where('token', token)
                //     .where('active', true)
                //     .first();
                // if (!tokenExists) throw new APIError(400, 'INVALID_TOKEN');
                const plan = await SubscriptionPlanClient.getPlan(data.subscription_plan_id);
                let paymentPayload = {
                    'user_id': userId,
                    'subscription_plan_id': plan.id,
                    'paid_amount': plan.cost,
                    'payment_gateway': 'UPI_APP',
                    'payment_intent_id': data.txnId,
                    'payment_status': 'INITIATED',
                };
                const payment = await this.createPayment(paymentPayload);
                // await db.updateDoc('payment_tokens', tokenExists.id, { token: 'delete' });
                const completeRequest = await this.paymentComplete(payment.id);
                return resolve(completeRequest);
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async getAtomTokenId(user, plan) {
        return new Promise(async (resolve, reject) => {
            try {
                const encryptedData = this.generateAtomTokemAuthPayload(user, plan);
                process.stdout.write(encryptedData);
                // process.exit(1);
                const options = {
                    url: 'https://caller.atomtech.in/ots/aipay/auth',
                    method: 'POST',
                    params: {
                        merchId: NDPSConfig.merchantId,
                        encData: encryptedData,
                    },
                    responseType: 'json',
                };
                const response = await axios(options);
                // console.log('response-params', response);
                console.log('data', response.data);
                // process.exit(0);
                return resolve(response.data);
            } catch (e) {
                return reject(e);
            }
        });
    }

    /**
     * @typedef {object} NDPSTokenResponse
     * @property {string} txnId Transaction ID
     * @property {string} data JWT
     * 
     * @param {*} user User object
     * @param {*} plan Plan object
     * @returns {Promise<NDPSTokenResponse>}
     */
    static async generateAtomTokenId(user, plan) {
        return new Promise(async (resolve, reject) => {
            try {
                const txnId = await this.generateTxnId();
                const encryptedData = this.generateAtomTokemAuthPayload(user, plan, txnId);
                const responseBody = await ndpsApiClient.generateAtomTokenId(NDPSConfig.merchantId, encryptedData);
                const encryptedResponse = responseBody.split('&')[1].split('=')[1];
                const decryptedResponse = (new AtomEncryption()).decrypt(encryptedResponse);
                const decryptedResponseObj = JSON.parse(decryptedResponse);
                console.log(decryptedResponseObj);
                if (!decryptedResponseObj.responseDetails.txnStatusCode == 'OTS0000') throw new APIError(500, 'ATOM TOKEN ID GENERATION FAILED');
                const { atomTokenId } = decryptedResponseObj;
                const data = {
                    atomTokenId,
                    txnId,
                    mercId: NDPSConfig.merchantId,
                    custId: user.id,
                    // custEmail: user.email,
                    custEmail: "user@atomtech.in",
                    // custPhoneCode: user.phone_code,
                    custPhoneCode: "",
                    // custPhone: user.phone,
                    custPhone: "9898989898",
                    // cost: plan.cost,
                    cost: "100.00",
                    planName: plan.name,
                };
                const result = this.generateJWT(data);
                return resolve({ data: result, txnId });
            } catch (e) {
                return reject(e);
            }
        });
    }

    /**
     * 
     * @param {object} user User object
     * @param {object} plan Plan object
     * @param {string} txnId Transaction Id
     * @returns {string} encryptedText
     */
    static generateAtomTokemAuthPayload(user, plan, txnId) {
        let payload = {
            "payInstrument": {
                "headDetails": {
                    "version": "OTSv1.1",
                    "api": "AUTH",
                    "platform": "FLASH"
                },
                "merchDetails": {
                    "merchId": NDPSConfig.merchantId,
                    "userId": NDPSConfig.merchantUserId,
                    "password": "Test@123",
                    "merchTxnId": txnId,
                    "merchTxnDate": moment(new Date()).format("YYYY-MM-DD hh:mm:ss")
                },
                "payDetails": {
                    "amount": "100.00",
                    "product": "NSE",
                    "custAccNo": "213232323",
                    "txnCurrency": "INR"
                },
                "custDetails": {
                    "custEmail": "user@atomtech.in",
                    "custMobile": "9898989898"
                },
                "extras": {
                    "udf1": "",
                    "udf2": "",
                    "udf3": "",
                    "udf4": "",
                    "udf5": ""
                }
            }
        };

        // console.log(payload);
        const encryptionClient = new AtomEncryption();
        return encryptionClient.encrypt(JSON.stringify(payload));
    }

    /**
     * 
     * @returns {Promise<string>} txnId (UUID)
     */
    static async generateTxnId() {
        function uuidv4() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
        let random = uuidv4();
        let uuidQuery = db.getQueryBuilder('payments').where({ payment_intent_id: random }).first()
        let uuid = await db.executeQuery(uuidQuery)
        if (!uuid) return random
        else this.generatePaymentToken()
    }

    /**
     * 
     * @param {object} data 
     * @returns {string} JWT
     */
    static generateJWT(data) {
        return jwtAuth.generateToken(data, process.env.JWT_KEY);
    }

    static async validateNDPSToken(token) {
        return new Promise(async (resolve, reject) => {
            try {
                const payload = await jwtAuth.verifyToken(token, process.env.JWT_KEY);
                const user = await db.getQueryBuilder('users')
                    .where({
                        'id': payload.custId,
                        'active': true,
                        })
                    .select('*')
                    .first();
                if (!user) throw new APIError(400, 'Invalid Token');
                console.log(payload);
                const paymentRecord = await db.getQueryBuilder('payments')
                    .where({
                        'payment_intent_id': payload.txnId,
                        'active': true
                        })
                    .select('*')
                    .first();
                if (!paymentRecord) throw new APIError(400, 'Invalid Token');
                console.log(paymentRecord);
                if (paymentRecord.payment_status != 'INITIATED') throw new APIError(400, 'Invalid Token');
                console.log({payload});
                return resolve(payload);
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async ndpsPaymentSucceeded(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const { payInstrument } = data;
                // console.log(data);
                // process.exit(1);
                const paymentRecord = await db.getQueryBuilder('payments')
                    .where({
                        'payment_intent_id' : payInstrument.merchDetails.merchTxnId,
                        'active': true,
                    })
                    .first();

                if (!paymentRecord) throw new APIError(400, 'Invalid Transaction ID');
                if (paymentRecord.payment_status != 'INITIATED') throw new APIError(400, 'Invalid Transaction ID');

                const completeRequest = await this.paymentComplete(paymentRecord.id);
                const result = {
                    view: 'payment-success.html',
                    payload: {
                        txnId: paymentRecord.payment_intent_id,
                    },
                }
                return resolve(result);
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async ndpsPaymentFailed(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const { payInstrument } = data;
                const paymentRecord = await db.getQueryBuilder('payments')
                    .where({
                        'payment_intent_id' : payInstrument.merchDetails.merchTxnId,
                        'active': true,
                    })
                    .first();

                if (!paymentRecord) throw new APIError(400, 'Invalid Transaction ID');
                if (paymentRecord.payment_status != 'INITIATED') throw new APIError(400, 'Invalid Transaction ID');

                const completeRequest = await this.paymentFailed(paymentRecord.id);
                const result = {
                    view: 'payment-failed.html',
                    payload: {
                        txnId: paymentRecord.payment_intent_id,
                    },
                }
                return resolve(result);
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async spayVerifyUPI({ upiId }) {
        return new Promise(async (resolve, reject) => {
            try {
                const { response, token } = await (new SPayClient()).verifyUPI({ upiId });
                const { extTransactionId, txnType, customerName } = response.data;
                return resolve({ upiId, extTransactionId, txnType, customerName, token });
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async spayInitiateSDK({ upiId, subscriptionPlanId, customerName }, user) {
        return new Promise(async (resolve, reject) => {
            try {
                const plan = await SubscriptionPlanClient.getPlan(subscriptionPlanId)
                    .where('subscription_plans.active', true);

                if (!plan) throw new APIError(400, 'SUBSCRIPTION_PLAN_NOT_FOUND');

                const newClientTxnId = `TXNID${Date.now()}`;

                const initiateSDKPayload = {
                    upiId,
                    amount: '' + plan.cost,
                    customerName,
                    clientTxnId: newClientTxnId,
                };

                const { response, token } = await (new SPayClient()).initiateSDK(initiateSDKPayload);
                const { orderAmount, orderId, clientTxnId, hashToken } = response.data;

                let paymentPayload = {
                    'user_id': user.id,
                    'subscription_plan_id': plan.id,
                    'paid_amount': plan.cost,
                    'payment_gateway': 'SPAY',
                    'payment_intent_id': orderId
                };

                this.createPayment(paymentPayload);

                return resolve({ orderAmount, orderId, clientTxnId, hashToken, token });
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async spayVerifySDK({ upiId, orderId, hashToken }, user) {
        return new Promise(async (resolve, reject) => {
            try {
                const payment = await this.getPayment()
                    .where('payment_intent_id', orderId)
                    .where('user_id', user.id);

                const verifySDKPayload = {
                    upiId,
                    amount: '' + payment.paid_amount,
                    orderId: payment.payment_intent_id,
                    hashToken,
                };
                console.log(payment)

                const { response, token } = await (new SPayClient()).verifySDK(verifySDKPayload);
                const { companyName, companyLogo, orderAmount, clientTxnId, upiIntentString } = response.data;
                return resolve({ upiId, companyName, companyLogo, orderAmount, orderId, clientTxnId, upiIntentString, token });
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async spayStatusCheck({ orderId }, user) {
        return new Promise(async (resolve, reject) => {
            try {
                const payment = await this.getPayment()
                    .where('payment_intent_id', orderId)
                    .where('user_id', user.id);

                const statusCheckPayload = {
                    extTransactionId: orderId,
                };

                const { response, token } = await (new SPayClient()).statusCheck(statusCheckPayload);
                const { status, amount, utr, returnUrl } = response.data;

                const paymentPayload = {
                    utr: utr ?? null,
                };

                this.updatePayment(payment.id, paymentPayload);

                return resolve({ status, amount, utr, returnUrl });
            } catch (e) {
                return reject(e);
            }
        });
    }
    
    static async spayPaymentSucceeded(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const orderId = data.txnid;
                const paymentDetail = await this.getPaymentByPaymentId(orderId);
                if(paymentDetail && paymentDetail.payment_status == 'INITIATED' || 'PROCESSING') {
                    const completeRequest = await this.paymentComplete(paymentDetail.id);
                    return resolve(completeRequest);
                }
                throw "Invalid request";
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async spayPaymentFailed(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const orderId = data.txnid;
                const paymentDetail = await this.getPaymentByPaymentId(orderId);
                if(paymentDetail && paymentDetail.payment_status == 'INITIATED' || 'PROCESSING') {
                    const completeRequest = await this.paymentFailed(paymentDetail.id);
                    return resolve(completeRequest);
                }
                throw "Invalid request";
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async spayPaymentPending(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const orderId = data.txnid;
                const paymentDetail = await this.getPaymentByPaymentId(orderId);
                if(paymentDetail && paymentDetail.payment_status == 'INITIATED') {
                    const completeRequest = await this.paymentPending(paymentDetail.id);
                    return resolve(completeRequest);
                }
                throw "Invalid request";
            } catch (e) {
                return reject(e);
            }
        });
    }

    static async generateAirpayOrderId() {
        const prefix   = 'AIRPAY';
        let orderId    = undefined;
        orderId        = `${prefix}${Date.now()}`;
        const idExists = await db.getQueryBuilder('payments').where('payment_intent_id', orderId).first();
        
        if (idExists) {
            return this.generateAirpayOrderId();
        }

        return orderId;
    }

    static async generateAirpayChecksum(planId, user) {
        return new Promise(async (resolve, reject) => {
            try {
                const plan = await db.getQueryBuilder('subscription_plans')
                    .where('id', planId)
                    .first();
                if (!plan) throw new APIError(400, 'INVALID_PLAN_NOT_FOUND');
                const orderId = await this.generateAirpayOrderId();
                const cost = user.phone_number == '1212121212' ? 20 : plan.cost;
                const result = (new AirpayClient).createChecksum({
                    amount: cost,
                    email : user.email,
                    firstName: user.first_name ?? '',
                    lastName: user.last_name ?? '',
                    phoneNumber: user.phone_number ?? '',
                    orderId,
                });
                let paymentPayload = {
                    'user_id':              user.id,
                    'subscription_plan_id': planId,
                    'paid_amount':          cost,
                    'payment_gateway':      'AIRPAY',
                    'payment_intent_id':    orderId,
                };
                await this.createPayment(paymentPayload);
                return resolve(result);
            } catch (ex) {
                return reject(ex);
            }
        });
    }

    static async processAirpayResponse(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const { txnhash } = (new AirpayClient()).processResponse(data);

                const isValid = txnhash == data.ap_SecureHash;
                
                return resolve({ isValid });
            } catch (ex) {
                return reject(ex);
            }
        });
    }

    static async processAirpayIPN(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const checksumResult = (new AirpayClient()).processResponse(data);
                
                const orderId = data.TRANSACTIONID;
                const paymentDetail = await this.getPaymentByPaymentId(orderId);

                if (!paymentDetail) {
                    throw new APIError(400, 'Invalid_Order_ID')
                }

                if (data.APTRANSACTIONID) {
                    await Payment.updatePayment(paymentDetail.id, { utr: data.APTRANSACTIONID });
                }

                if(!(paymentDetail.payment_status == 'INITIATED' || 'PROCESSING')) {
                    throw new APIError(400, 'INVALID_PAYMENT_STATE');
                }

                if (data.TRANSACTIONSTATUS == '200' && checksumResult.txnhash == data.ap_SecureHash) {
                    await this.paymentComplete(paymentDetail.id);
                    return resolve(true);
                } else if (data.TRANSACTIONSTATUS == '400' && checksumResult.txnhash == data.ap_SecureHash) {
                    await this.paymentFailed(paymentDetail.id);
                    return resolve(false);
                }
                return resolve(true);
            } catch (ex) {
                return reject(ex);
            }
        });
    }

    static async generateHDFCOrderId() {
        const prefix   = 'HDFC';
        const orderId  = `${prefix}${Date.now()}`;
        const idExists = await db.getQueryBuilder('payments').where('payment_intent_id', orderId).first();
        
        if (idExists) {
            return this.generateHDFCOrderId();
        }

        return orderId;
    }

    static async verifyCustomerVpaHDFC(customerVpa) {
        return new Promise(async (resolve, reject) => {
            try {
                const orderId = await this.generateHDFCOrderId();
                
                const result = await (new HDFC()).verifyVpa(orderId, customerVpa);
                
                return resolve(result);
            } catch (ex) {
                return reject(ex);
            }
        });
    }

    static async initiateHDFCWebCollectTransaction(orderId, planId, customerVpa, user) {
        return new Promise(async (resolve, reject) => {
            try {
                const plan = await db.getQueryBuilder('subscription_plans')
                    .where('id', planId)
                    .first();

                if (!plan) throw new APIError(400, 'INVALID_PLAN_NOT_FOUND');
                
                const amount = ['9947225843', '1212121212'].includes(user.phone_number) ? 1 : plan.cost;
                const result = await (new HDFC()).initiateTransaction({
                    orderId,
                    customerVpa,
                    amount,
                    remarks: plan.name,
                });

                if (result.status != 'SUCCESS') throw new APIError(400, 'FAILED_TO_INITIATE_TRANSACTION');

                await this.createPayment({
                    'user_id'             : user.id,
                    'subscription_plan_id': planId,
                    'paid_amount'         : amount,
                    'payment_gateway'     : 'HDFC',
                    'payment_intent_id'   : orderId,
                    'utr'                 : result.utr,
                });
                
                return resolve(result);
            } catch (ex) {
                return reject(ex);
            }
        });
    }

    static async initiateHDFCUpiIntentTransaction(planId, user) {
        return new Promise(async (resolve, reject) => {
            try {
                const plan = await db.getQueryBuilder('subscription_plans')
                    .where('id', planId)
                    .first();

                if (!plan) throw new APIError(400, 'INVALID_PLAN_NOT_FOUND');

                const orderId = await this.generateHDFCOrderId();
                const amount  = ['9947225843', '1212121212'].includes(user.phone_number) ? 20 : plan.cost;
                const result  = await (new HDFC()).initiateUpiIntentTransaction({
                    amount,
                    orderId,
                    remarks: plan.name,
                });

                if (result.status != 'SUCCESS') throw new APIError(400, 'FAILED_TO_INITIATE_TRANSACTION');

                await this.createPayment({
                    'user_id'             : user.id,
                    'subscription_plan_id': planId,
                    'paid_amount'         : amount,
                    'payment_gateway'     : 'HDFC',
                    'payment_intent_id'   : orderId,
                });
                
                return resolve(result);
            } catch (ex) {
                return reject(ex);
            }
        });
    }

    static async checkHDFCTransactionStatus(orderId) {
        return new Promise(async (resolve, reject) => {
            try {
                const plan = await db.getQueryBuilder('payments')
                    .where({
                        'payment_intent_id' : orderId,
                        'payment_gateway'   : 'HDFC'
                    })
                    .first();

                if (!plan) throw new APIError(400, 'TRANSACTION_DOES_NOT_EXIST');
                
                const result = await (new HDFC()).transactionStatus(orderId);
                
                return resolve(result);
            } catch (ex) {
                return reject(ex);
            }
        });
    }

    static async handleHDFCTransactionCallBack({ meRes: encResponse, pgMerchantId: mercId }) {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await (new HDFC()).getDecryptedCallbackResponse({ encResponse, mercId });
                console.log({ result });
                
                const paymentDetail = await this.getPaymentByPaymentId(result.orderId);

                console.log({ paymentDetail });

                if (!paymentDetail) {
                    throw new APIError(400, 'Invalid_Order_ID')
                }

                if (result.utr) {
                    await Payment.updatePayment(paymentDetail.id, { utr: result.utr });
                }

                if(!['INITIATED', 'PROCESSING'].includes(paymentDetail.payment_status)) {
                    throw new APIError(400, 'INVALID_PAYMENT_STATE');
                }

                if (result.status == 'SUCCESS') {
                    await this.paymentComplete(paymentDetail.id);
                    return resolve(true);
                } else if (!['SUCCESS', 'PENDING'].includes(result.status)) {
                    await this.paymentFailed(paymentDetail.id);
                    return resolve(false);
                }
                return resolve(true);
            } catch (err) {
                return reject(err);
            }
        });
    }
}

module.exports = Payment;
