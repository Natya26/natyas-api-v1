'use strict';
const crypto = require('crypto');
const axios = require('axios');
const config = require('../config/hdfc.config');

module.exports = class HDFC {
    constructor() {}
    
    #orderId;
    #customerVpa;
    #amount = 0;
    #remarks;
    #encCbResponse;
    #verifyVpaStatuses = Object.freeze({
        'VE' :'Available', 
        'VN' :'Not Available', 
        'F'  :'Failed',
    });
    static transactionStatuses = Object.freeze({
        SUCCESS  : 'SUCCESS',
        FAILED   : 'FAILED', 
        PENDING  : 'PENDING',
        EXPIRED  : 'EXPIRED', 
        REJECTED : 'REJECTED',
        SPAM     : 'SPAM',
    });

    #config  = () => config;

    /**
     * 
     * @param {string} orderId 
     * @returns {Promise<TransactionStatusResult>}
     */
    async transactionStatus(orderId) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof orderId != 'string') throw new Error('Invalid orderId');
                
                this.#orderId = orderId;
                
                const result = await this.#checkTransactionStatus();
                
                return resolve(result);
            } catch (err) {
                return reject(err);
            }
        });
    }
    
    /**
     * 
     * @param {string} orderId 
     * @param {string} customerVpa 
     * @returns {Promise<VerifyCustomerVpaResult>}
     */
    async verifyVpa(orderId, customerVpa) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof orderId != 'string') throw new Error('Invalid orderId');
                this.#orderId     = orderId;
                this.#customerVpa = customerVpa;
                
                const result = await this.#verifyCustomerVpa();
                
                return resolve(result);
            } catch (err) {
                return reject(err);
            }
        });
    }

    /**
     * 
     * @param {Object} payload
     * @property {string} payload.orderId
     * @property {string} payload.customerVpa
     * @property {number} payload.amount
     * @property {string} payload.remarks
     * @returns {Promise<InitiateTransactionResult}
     */
    async initiateTransaction({ orderId, customerVpa, amount, remarks }) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof orderId != 'string') throw new Error('Invalid orderId');
                this.#orderId     = orderId;
                this.#customerVpa = customerVpa;
                this.#amount      = amount;
                this.#remarks     = remarks;

                const result = await this.#initiateCollectTransactionRequest();

                return resolve(result);
            } catch (err) {
                return reject(err);
            }
        });
    }

    async initiateUpiIntentTransaction({ orderId, amount, remarks}) {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof orderId != 'string') throw new Error('Invalid orderId');
                this.#orderId     = orderId;
                this.#amount      = amount;
                this.#remarks     = remarks;

                const result = await this.#initiateUpiIntentTransactionRequest();

                return resolve(result);
            } catch (err) {
                return reject(err);
            }
        });
    }

    async getDecryptedCallbackResponse({ encResponse, mercId }) {
        return new Promise(async (resolve, reject) => {
            try {
                const { merchantId } = this.#config();

                if (!merchantId) reject('merchantId config not found');
                
                if (mercId != merchantId) reject('Merchant Id does not match');

                const  result = this.#getOrderIdUtrAndStatusFromCallbackResponse(encResponse);
                
                return resolve(result);
            } catch (err) {
                return reject(err);
            }
        });
    }

    // axios request
    /**
     * 
     * @returns {Promise<TransactionStatusResult>}
     */
    async #checkTransactionStatus() {
        return new Promise(async (resolve, reject) => {
            try {
                const { baseURL, merchantId }
                = this.#config();
                const payload = this.#createTransactionStatusReqPayload();
                const options = {
                    url: `${baseURL}/transactionStatusQuery`,
                    method: 'POST',
                    data: {
                        requestMsg: payload,
                        pgMerchantId: merchantId, 
                    }
                };
                
                const { data } = await axios(options);
                console.log({data}, '#checkTransactionStatus');
                const result   = this.#getOrderIdAndStatusFromTransactionStatus(data);
                console.log({result}, '#checkTransactionStatus');
                
                return resolve(result);
            } catch (err) {
                return reject(err);
            }
        });
    }
    
    // axios request
    /**
     * 
     * @returns {Promise<VerifyCustomerVpaResult>}
     */
    async #verifyCustomerVpa() {
        return new Promise(async (resolve, reject) => {
            try {
                const { baseURL, merchantId }
                = this.#config();
                const payload = this.#createVerifyCustomerVpaPayload();
                const options = {
                    url: `${baseURL}/checkMeVirtualAddress`,
                    method: 'POST',
                    data: {
                        requestMsg: payload,
                        pgMerchantId: merchantId, 
                    }
                };
                
                const { data } = await axios(options);
                console.log({data}, '#verifyCustomerVpa');
                const result   = this.#getOrderIdAndCustomerVpaDetailsFromResponse(data);
                console.log({result}, '#verifyCustomerVpa');
                
                return resolve(result);
            } catch (err) {
                return reject(err);
            }
        });
    }
    
    // axios request
    /**
     * 
     * @returns {Promise<InitiateTransactionResult>}
     */
    async #initiateCollectTransactionRequest() {
        return new Promise(async (resolve, reject) => {
            try {
                const { baseURL, merchantId }
                              = this.#config();
                const payload = this.#createWebCollectRequestPayload();
                const options = {
                    url: `${baseURL}/meTransCollectSvc`,
                    method: 'POST',
                    data: {
                        requestMsg: payload,
                        pgMerchantId: merchantId, 
                    }
                };

                const { data } = await axios(options);
                console.log({data}, '#initiateCollectTransactionRequest');
                const result   = this.#getOrderIdAndCollectRequestInitiationStatusFromResponse(data);
                console.log({result}, '#initiateCollectTransactionRequest');
                
                return resolve(result);
            } catch (err) {
                return reject(err);
            }
        });
    }
    
    // axios request
    async #initiateUpiIntentTransactionRequest() {
        return new Promise(async (resolve, reject) => {
            try {
                const { baseURL, merchantId }
                              = this.#config();
                const payload = this.#createUpiIntentTransactionPayload();
                const options = {
                    url: `${baseURL}/mePayInetentReq`,
                    method: 'POST',
                    data: {
                        requestMsg: payload,
                        pgMerchantId: merchantId, 
                    }
                };

                const { data } = await axios(options);
                console.log({data}, '#initiateUpiIntentTransactionRequest');
                const result   = this.#getOrderIdAndUpiIntentInitiationStatusFromResponse(data);
                console.log({result}, '#initiateUpiIntentTransactionRequest');
                
                return resolve(result);
            } catch (err) {
                return reject(err);
            }
        });
    }

    #createTransactionStatusReqPayload() {
        const payload = this.#transactionStatusPayload();
        console.log({payload}, '#createTransactionStatusReqPayload');
        const encPayload = this.#encrypt(payload);
        console.log({encPayload}, '#createTransactionStatusReqPayload');

        return encPayload;
    }

    #createVerifyCustomerVpaPayload() {
        const payload = this.#verifyVpaPayload();
        console.log({payload}, '#createTransactionStatusReqPayload');
        const encPayload = this.#encrypt(payload);
        console.log({encPayload}, '#createTransactionStatusReqPayload');

        return encPayload;
    }

    #createWebCollectRequestPayload() {
        const payload = this.#webCollectRequestPayload();
        console.log({payload}, '#createTransactionStatusReqPayload');
        const encPayload = this.#encrypt(payload);
        console.log({encPayload}, '#createTransactionStatusReqPayload');

        return encPayload;
    }

    #createUpiIntentTransactionPayload() {
        const payload = this.#upiIntentTransactionPayload();
        console.log({payload}, '#createTransactionStatusReqPayload');
        const encPayload = this.#encrypt(payload);
        console.log({encPayload}, '#createTransactionStatusReqPayload');

        return encPayload;
    }

    #transactionStatusPayload() {
        const { merchantId } = this.#config();
        
        return `${merchantId}|${this.#orderId}|||||||||||NA|NA`;
    }

    #verifyVpaPayload() {
        const { merchantId } = this.#config();
        
        return `${merchantId}|${this.#orderId}|${this.#customerVpa}|T|||||||||NA|NA`;
    }

    #webCollectRequestPayload() {
        const { merchantId } = this.#config();
        
        return `${merchantId}|${this.#orderId}|${this.#customerVpa}|${this.#amount}|${this.#remarks}|10||||||||||NA|NA`;
    }

    #upiIntentTransactionPayload() {
        const { merchantId, merchantCode, merchantVPA, storeName } = this.#config();
        
        return `${merchantId}|${this.#orderId}|${merchantCode}|P2M|Pay|${this.#remarks}|${merchantVPA}|${storeName}|${this.#amount}|||||||||NA|NA`;
    }

    /**
     * @typedef {Object} TransactionStatusResult
     * @property {string} orderId
     * @property { "SUCCESS" | "FAILED" | "PENDING" | "EXPIRED" | "REJECTED" | "SPAM"} status
     */

    /**
     * 
     * @param {string} encResponse 
     * @returns {TransactionStatusResult}
     */
    #getOrderIdAndStatusFromTransactionStatus(encResponse) {
        const response = this.#decrypt(encResponse)?.split('|');
        const result = {
            orderId : response[1],
            status  : response[4],
        };
        console.log({response, result})
        if (this.#orderId != result.orderId) throw new Error('Order Id Mismatch');

        return result;
    }

    /**
     * 
     * @param {string} encResponse 
     * @returns {VerifyCustomerVpaResult}
     */
    #getOrderIdAndCustomerVpaDetailsFromResponse(encResponse) {
        const response = this.#decrypt(encResponse).split('|');
        const result   = {
            orderId      : response[0],
            customerVpa  : response[1],
            customerName : response[2],
            status       : this.#verifyVpaStatus(response[3]),
        };

        if (this.#orderId != result.orderId) throw new Error('Order Id Mismatch');

        return result;
    }

    /**
     * @typedef {Object} InitiateTransactionResult
     * @property {string} orderId
     * @property {string} utr
     * @property {number} amount
     * @property {string} status
     * @property {string} description
     * @property {string} customerVpa
     */

    /**
     * 
     * @param {string} encResponse 
     * @returns {InitiateTransactionResult}
     */
    #getOrderIdAndCollectRequestInitiationStatusFromResponse(encResponse) {
        const response = this.#decrypt(encResponse).split('|');
        const result   = {
            orderId     : response[0],
            utr         : response[1],
            amount      : Number(response[2]),
            status      : response[3],
            description : response[4],
            customerVpa : response[5],
        };

        if (this.#orderId != result.orderId) throw new Error('Order Id Mismatch');

        return result;
    }

    #getOrderIdAndUpiIntentInitiationStatusFromResponse(encResponse) {
        const response = this.#decrypt(encResponse).split('|');
        const result   = {
            orderId     : response[0],
            status      : response[1],
            description : response[2],
            amount      : this.#amount,
            intentURI   : this.#generateIntentString(response[1]),
        };

        if (this.#orderId != result.orderId) throw new Error('Order Id Mismatch');

        return result;
    }

    #getOrderIdUtrAndStatusFromCallbackResponse(encResponse) {
        const response = this.#decrypt(encResponse).split('|');
        const result   = {
            utr         : response[0],
            orderId     : response[1],
            status      : response[4],
            description : response[5],
        };

        return result;
    }

    #generateIntentString(status) {
        if (status != 'SUCCESS') return null;
        const { storeName, merchantVPA, merchantCode } = this.#config();

        return `upi://pay?pa=${merchantVPA}&pn=${storeName}&mc=${merchantCode}&tr=${this.#orderId}&mode=04&am=${this.#amount}&cu=IN`;
    }

    #verifyVpaStatus(code) {
        if (Object.keys(this.#verifyVpaStatuses).includes(code))
        return this.#verifyVpaStatuses[code];
    
        return this.#verifyVpaStatuses['F'];
    }

    #encrypt(payload) {
        if (typeof payload != 'string') throw new Error('Invalid payload type');

        const decryptionKey = this.#config().merchantKey;
        const secureKey     = Buffer.from(decryptionKey, 'hex');
        const cipher        = crypto.createCipheriv('aes-128-ecb', secureKey, null);
        const encrypted     = cipher.update(payload, 'utf8', 'hex') + cipher.final('hex');

        return encrypted;
    }

    #decrypt(payload) {
        if (typeof payload != 'string') throw new Error('Invalid payload type');
        
        const decryptionKey = this.#config().merchantKey;
        const secureKey     = Buffer.from(decryptionKey, 'hex');
        const decipher      = crypto.createDecipheriv('aes-128-ecb', secureKey, null);
        const decrypted     = decipher.update(payload, 'hex', 'utf8') + decipher.final('utf8');

        return decrypted;
    }
}