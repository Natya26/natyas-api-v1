const { body, param, query, validationResult } = require('express-validator');
const APIError = require('./../errors/APIError');
const { apiFmt } = require('./../services/fmt');
const SubscriptionClient = require('./subscription');
const SubscriptionPlanClient = require('./../subscription-plans/subscriptionPlan');
const PaymentClient = require('./payment');
const moment = require('moment/moment');

const ctrl  = {};
module.exports = ctrl;

ctrl.handleGetPlanList = async (req, res, next) => {
    try {
        validateReq(req);
        let { page, page_length, order = 'DESC' } = req.query;
        page = Number(page);
        page_length = Number(page_length);
        const limit = page_length ? page_length : undefined;
        const offset = (page && page_length) ? ((page - 1) * page_length) : undefined;
        const orderBy = [
            {
                column: 'subscription_plans.created_at',
                order
            }
        ];
        const plans = await SubscriptionPlanClient.getPlanList(limit, offset, orderBy)
            .where('subscription_plans.active', true);
        return res.json(apiFmt(plans, 'SUCCESS'));
    } catch (e) {
        console.log('handleGetPlanList --- ERROR', e);
        next(e);
    }
}

ctrl.handleCreatePayment = async (req, res, next) => {
    try {
        validateReq(req);
        const { subscription_plan_id: planId, payment_gateway: paymentGateway} = req.body;
        const plan = await SubscriptionPlanClient.getPlan(planId)
            .where('subscription_plans.active', true);
        let paymentPayload = {
            'user_id': req.user.id,
            'subscription_plan_id': planId,
            'paid_amount': plan.cost,
            'payment_gateway': paymentGateway,
        };
        let paymentGatewayConsent = { paymentGateway: paymentGateway };
        if(paymentGateway == 'STRIPE'){
            const { paymentIntent, STRIPE_PUBLISHABLE_KEY } = await PaymentClient.createPaymentIntent(plan);
            paymentPayload['payment_intent_id'] = paymentIntent.id; 
            paymentGatewayConsent['paymentIntent'] = paymentIntent.client_secret;
            paymentGatewayConsent['publishableKey'] = STRIPE_PUBLISHABLE_KEY;
        }else if(paymentGateway == 'RAZORPAY'){
            const rzpOrder = await PaymentClient.createRazorpayPaymentOrder(plan);
            console.log(rzpOrder,'rzpOrder -- ');
            paymentPayload['payment_intent_id'] = rzpOrder.id;
            paymentGatewayConsent['payment_order_id'] = rzpOrder.id;
        } else if (paymentGateway == 'NTTDATA') {
            const result = await PaymentClient.generateAtomTokenId(req.user, plan);
            console.log(result);
            paymentPayload['payment_intent_id'] = result.txnId;
            paymentGatewayConsent['payment_order_id'] = result.data;
        }
        const payment = await PaymentClient.createPayment(paymentPayload);
        const response = { ...paymentGatewayConsent, ...{ paymentId: payment['id'] } };
        return res.json(apiFmt(response, 'SUCCESS'));
    } catch (e) {
        console.log('handleCreatePayment --- ERROR', e);
        next(e);
    }
}

ctrl.handleUpdatePayment = async (req, res, next) => {
    try {
        validateReq(req);
        const { payment_id: paymentId } = req.params;
        const { status } = req.body;
        const paymentPayload = { payment_status: status };
        const payment = await PaymentClient.updatePayment(paymentId, paymentPayload);
        if (status == 'COMPLETED') {
            const planId = payment.subscription_plan_id;
            const plan = await SubscriptionPlanClient.getPlan(planId);
            const startDate = moment().toISOString();
            const endDate = moment().add(plan.validity, plan.validity_unit).subtract(1, "DAY").toISOString();
            const subscriptionPayload = {
                'subscription_plan_id': planId,
                'user_id': req.user.id,
                'valid_from': startDate,
                'valid_till': endDate,
                'active': true,
            };
            const subscriptionExists = await SubscriptionClient.getSubscription()
                .where('subscriptions.user_id', req.user.id);
            if (subscriptionExists)
                await SubscriptionClient.updateSubscription(subscriptionExists.id, subscriptionPayload);
            else
                await SubscriptionClient.createSubscription(subscriptionPayload);
            
        }
        return res.json(apiFmt(payment, 'SUCCESS'));
    } catch (e) {
        console.log('handleUpdatePayment --- ERROR', e);
        next(e);
    }
}

ctrl.handleGetPayment = async (req, res, next) => {
    try {
        validateReq(req);
        const { payment_id: paymentId } = req.params;
        const payment = await PaymentClient.getPayment(paymentId) ?? null;
        return res.json(apiFmt(payment, 'SUCCESS'));
    } catch (e) {
        console.log('handleGetPayment --- Error', e);
        next(e);
    }
}

ctrl.handleListPayment = async (req, res, next) => {
    try {
        let { page, page_length, order = 'DESC' } = req.query;
        page = Number(page);
        page_length = Number(page_length);
        const limit = page_length ? page_length : undefined;
        const offset = (page && page_length) ? ((page - 1) * page_length) : undefined;
        const orderBy = [
            {
                column: 'payments.created_at',
                order
            }
        ];
        const payments = await PaymentClient.getPaymentList(limit, offset, orderBy)
            .where('payments.active', true);
        return res.json(apiFmt(payments, 'SUCCESS'));
    } catch (e) {
        console.log('handleListPayment --- ERROR', e);
        next(e);
    }
}

ctrl.handleDeletePayment = async (req, res, next) => {
    try {
        validateReq(req);
        const { payment_id: paymentId } = req.params;
        const payload = { active: false };
        const payment = await PaymentClient.updatePayment(paymentId, payload);
        return res.json(apiFmt(payment, 'SUCCESS'));
    } catch (e) {
        console.log('handleDeletePayment --- ERROR', e);
        next(e);
    }
}

ctrl.handleListSubscription = async (req, res, next) => {
    try {
        let { page, page_length, order = 'DESC' } = req.query;
        page = Number(page);
        page_length = Number(page_length);
        const limit = page_length ? page_length : undefined;
        const offset = (page && page_length) ? ((page - 1) * page_length) : undefined;
        const orderBy = [
            {
                column: 'subscriptions.created_at',
                order
            }
        ];
        const subscriptions = await SubscriptionClient.getSubscriptionList(limit, offset, orderBy)
            .where('subscriptions.active', true);
        return res.json(apiFmt(subscriptions, 'SUCCESS'));
    } catch (e) {
        console.log('handleListSubscription --- ERROR', e);
        next(e);
    }
}

ctrl.handleGetSubscription = async (req, res, next) => {
    try {
        validateReq(req);
        const { subscription_id: id } = req.params;
        const subscription = await SubscriptionClient.getSubscription(id) ?? null;
        return res.json(apiFmt(subscription, 'SUCCESS'));
    } catch (e) {
        console.log('handleGetSubscription --- ERROR', e);
        next(e);
    }
}

ctrl.handleCreateSubscription = async (req, res, next) => {
    try {
        validateReq(req);
        const subscriptionExists = await SubscriptionClient.getSubscription()
            .where('subscriptions.user_id', req.body.user_id);
        if (subscriptionExists) throw new APIError(400, 'User already has a subscription');
        const { subscription_plan_id, user_id, valid_from, valid_till, active } = req.body;
        const payload = {
            subscription_plan_id,
            user_id,
            valid_from: valid_from ? valid_from : undefined,
            valid_till: valid_till ? valid_till : undefined,
        };
        const subscription = await SubscriptionClient.createSubscription(payload);
        return res.json(apiFmt(subscription, 'SUCCESS'));
    } catch (e) {
        console.log('handleCreateSubscription --- ERROR', e);
        next(e);
    }
}

ctrl.handleUpdateSubscription = async (req, res, next) => {
    try {
        validateReq(req);
        const { subscription_id: id } = req.params;
        const subscriptionExists = await SubscriptionClient.getSubscription(id);
        if (!subscriptionExists) throw new APIError(400, 'Subscription does not exist');
        const payload = { valid_from, valid_till, subscription_plan_id } = req.body;
        const subscription = await SubscriptionClient.updateSubscription(id, payload);
        return res.json(apiFmt(subscription, 'SUCCESS'));
    } catch (e) {
        console.log('handleUpdateSubscription --- ERROR', e);
        next(e);
    }
}

ctrl.handleDeleteSubscription = async (req, res, next) => {
    try {
        validateReq(req);
        const { subscription_id: id } = req.params;
        const subscriptionExists = await SubscriptionClient.getSubscription(id)
            .where('subscriptions.active', true);
        if (!subscriptionExists) throw new APIError(400, 'Subscription does not exist or is inactive');
        const payload = { active: false };
        const subscription = await SubscriptionClient.updateSubscription(id, payload);
        return res.json(apiFmt(subscription, 'SUCCESS'));
    } catch (e) {
        console.log('handleDeleteSubscription --- ERROR', e);
        next(e);
    }
}

ctrl.handleGetPaymentToken = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const {
            subscription_plan_id: planId,
            payment_method: paymentMethod,
        } = req.body;
        const response = await PaymentClient.getPaymentToken(userId, planId, paymentMethod);
        res.json(apiFmt(response, 'SUCCESS'));
    } catch (e) {
        console.log('handleGeneratePaymentToken --- Error', e);
        next(e);
    }
}

ctrl.handleCompletePaymentWithToken = async (req, res, next) => {
    try {
        validateReq(req);
        const data = req.body;
        const result = await PaymentClient.completePaymentWithToken(data, req.user.id);
        return res.json(apiFmt(result, 'SUCCESS'));
    } catch (e) {
        console.log('handleCompletePaymentWithToken --- Error', e);
        next(e);
    }
}

ctrl.handleSPayVerifyUPI = async (req, res, next) => {
    try {
        validateReq(req);
        const result = await PaymentClient.spayVerifyUPI(req.body);
        return res.json(apiFmt(result, 'SUCCESS'));
    } catch (e) {
        console.log('handleSPayVerifyUPI --- Error', e);
        next(e);
    }
}

ctrl.handleSPayInitiateSDK = async (req, res, next) => {
    try {
        validateReq(req);
        const result = await PaymentClient.spayInitiateSDK(req.body, req.user);
        return res.json(apiFmt(result, 'SUCCESS'));
    } catch (e) {
        console.log('handleSPayInitiateSDK --- Error', e);
        next(e);
    }
}

ctrl.handleSPayVerifySDK = async (req, res, next) => {
    try {
        validateReq(req);
        const result = await PaymentClient.spayVerifySDK(req.body, req.user);
        return res.json(apiFmt(result, 'SUCCESS'));
    } catch (e) {
        console.log('handleSPayVerifySDK --- Error', e);
        next(e);
    }
}

ctrl.handleSPayStatusCheck = async (req, res, next) => {
    try {
        validateReq(req);
        const result = await PaymentClient.spayStatusCheck(req.body, req.user);
        return res.json(apiFmt(result, 'SUCCESS'));
    } catch (e) {
        console.log('handleSPayStatusCheck --- Error', e);
        next(e);
    }
}

ctrl.handleGenerateAirpayChecksum = async (req, res, next) => {
    try {
        validateReq(req);
        const { user }   = req;
        const { planId } = req.body;
        const response = await PaymentClient.generateAirpayChecksum(planId, user);

        return res.json(apiFmt(response, 'AIRPAY_CHECKSUM'));
    } catch (ex) {
        console.log('handleGenerateAirpayChecksum --- ERROR:', ex);
        return next(ex);
    }
}

ctrl.handleHDFCVerifyCustomerVpa = async (req, res, next) => {
    try {
        validateReq(req);
        const { user }        = req;
        const { customerVpa } = req.body;
        const response        = await PaymentClient.verifyCustomerVpaHDFC(customerVpa);

        return res.json(apiFmt(response, 'Verify customer VPA result'));
    } catch (ex) {
        console.log('handleHDFCVerifyCustomerVpa --- ERROR:', ex);
        return next(ex);
    }
}

ctrl.handleInitiateHDFCWebCollectTransaction = async (req, res, next) => {
    try {
        validateReq(req);
        const { user } = req;
        const { orderId, planId, customerVpa } = req.body;
        const response = await PaymentClient.initiateHDFCWebCollectTransaction(orderId, planId, customerVpa, user);

        return res.json(apiFmt(response, 'Initiate Web Collect result'));
    } catch (ex) {
        console.log('handleInitiateHDFCWebCollectTransaction --- ERROR:', ex);
        return next(ex);
    }
}

ctrl.handleInitiateHDFCUpiIntentTransaction = async (req, res, next) => {
    try {
        validateReq(req);
        const { user }   = req;
        const { planId } = req.body;
        const response   = await PaymentClient.initiateHDFCUpiIntentTransaction(planId, user);

        return res.json(apiFmt(response, 'Initiate UPI Intent Tranction result'));
    } catch (ex) {
        console.log('handleInitiateHDFCUpiIntentTransaction --- ERROR:', ex);
        return next(ex);
    }
}

ctrl.handleCheckHDFCTransactionStatus = async (req, res, next) => {
    try {
        validateReq(req);
        const { orderId } = req.query;
        const response    = await PaymentClient.checkHDFCTransactionStatus(orderId);

        return res.json(apiFmt(response, 'Transaction Status'));
    } catch (ex) {
        console.log('handleCheckHDFCTransactionStatus --- ERROR:', ex);
        return next(ex);
    }
}

function validateReq(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new APIError(400, "Invalid request", errors);
}

function validate(method) {

    switch (method) {
        case 'handleCompletePaymentWithToken': {
            return [
                // body('token').exists().notEmpty(),
                body('subscription_plan_id').exists().notEmpty(),
                body('txnId').exists().notEmpty(),
            ];
        }
        case 'handleCreatePayment': {
            return [
                body('subscription_plan_id').exists().notEmpty().isNumeric(),
                body('payment_gateway').exists().notEmpty().isString().isIn(['STRIPE', 'RAZORPAY', 'NTTDATA']),
            ];
        }
        case 'handleUpdatePayment': {
            return [
                body('status').exists().notEmpty().isIn(['INITIATED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELED']),
            ];
        }
        case 'handleGetPayment': {
            return [
                param('payment_id').exists().notEmpty().isNumeric(),
            ];
        }
        case 'handleGetSubscription': {
            return [
                param('subscription_id').exists().notEmpty().isNumeric(),
            ];
        }
        case 'handleCreateSubscription': {
            return [
                body('subscription_plan_id').exists().notEmpty().isNumeric(),
                body('user_id').exists().notEmpty(),
                body('valid_from').optional(),
                body('valid_till').optional(),
            ];
        }
        case 'handleUpdateSubscription': {
            return [
                param('subscription_id').exists().notEmpty().isNumeric(),
                body('subscription_plan_id').exists().notEmpty().isNumeric(),
                body('valid_from').exists().notEmpty().isDate(),
                body('valid_till').exists().notEmpty().isDate(),
            ];
        }
        case 'handleDeleteSubscription': {
            return [
                param('subscription_id').exists().notEmpty().isNumeric(),
            ];
        }
        case 'handleSPayVerifyUPI': {
            return [
                body('upiId').exists().notEmpty(),
            ];
        }
        case 'handleSPayInitiateSDK': {
            return [
                body('upiId').exists().notEmpty(),
                body('subscriptionPlanId').exists().notEmpty(),
                body('customerName').exists().notEmpty(),
            ];
        }
        case 'handleSPayVerifySDK': {
            return [
                body('upiId').exists().notEmpty(),
                body('orderId').exists().notEmpty(),
                body('hashToken').exists().notEmpty(),
            ];
        }
        case 'handleSPayStatusCheck': {
            return [
                body('orderId').exists().notEmpty(),
            ];
        }
        case 'handleGenerateAirpayChecksum': {
            return [
                body('planId').exists().notEmpty().isNumeric(),
            ];
        }
        case 'handleHDFCVerifyCustomerVpa': {
            return [
                body('customerVpa').exists().notEmpty().isString(),
            ];
        }
        case 'handleInitiateHDFCWebCollectTransaction': {
            return [
                body('orderId').exists().notEmpty().isString(),
                body('planId').exists().notEmpty().isNumeric(),
                body('customerVpa').exists().notEmpty().isString(),
            ];
        }
        case 'handleInitiateHDFCUpiIntentTransaction': {
            return [
                body('planId').exists().notEmpty().isNumeric(),
            ];
        }
        case 'handleCheckHDFCTransactionStatus': {
            return [
                query('orderId').exists().notEmpty().isString(),
            ];
        }
        default: {
            return [];
        }
    }
}

ctrl.validate = validate;