'use strict';

const axios = require('axios');
const APIError = require('./../errors/APIError');
const spayConfig = require('./../config/spay.config');
//#region SPayClient

class SPayClient {
    //#region properties

    #spayToken                 = undefined;
    #baseURI                   = 'https://dashboard.spay.live';
    #verifyUPIEndPoint         = '/api/upi2/verifyVPA';
    #initiateSDKEndPoint       = '/api/upi2/initiateRequest';
    #verifySDKEndPoint         = '/api/upi2/sdkVerify';
    #checkStatusEndPoint       = '/api/upi2/checkStatus';
    #generateDynamicQREndPoint = '/api/upi2/generateQr';
    #generateStaticQREndPoint  = '/api/upi2/generateStaticQr';
    #statusCheckEndPoint       = '/api/statusCheck';

    //#endregion

    //#region constructor

    constructor() {
        this.#spayToken = spayConfig.spayToken;
    }

    //#endregion

    //#region public methods

    async verifyUPI({ upiId }) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!upiId) throw new APIError(400, 'UPI_ID_REQUIRED');
                const options = {
                    url: this.#getVerifyUPIURI(),
                    method: 'POST',
                    data: {
                        token: this.#getSPayToken(),
                        upiId,
                    }       
                };
                const response = await axios(options);
                return resolve({ response: response.data, token: this.#getSPayToken() });
            } catch (e) {
                return reject(e);
            }
        });
    }

    async initiateSDK({ upiId, amount, customerName, clientTxnId }) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!upiId) throw new APIError(400, 'UPI_ID_REQUIRED');
                if (!amount) throw new APIError(400, 'AMOUNT_REQUIRED');
                if (!customerName) throw new APIError(400, 'CUSTOMER_NAME_REQUIRED');
                if (!clientTxnId) throw new APIError(400, 'CLIENT_TXN_ID_REQUIRED');
                const options = {
                    url: this.#getInitiateSDKURI(),
                    method: 'POST',
                    data: {
                        token: this.#getSPayToken(),
                        upiId,
                        amount,
                        customerName,
                        clientTxnId,
                    }       
                };
                const response = await axios(options);
                return resolve({ response: response.data, token: this.#getSPayToken() });
            } catch (e) {
                return reject(e);
            }
        });
    }

    async verifySDK({ upiId, amount, orderId, hashToken }) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!upiId) throw new APIError(400, 'UPI_ID_REQUIRED');
                if (!amount) throw new APIError(400, 'AMOUNT_REQUIRED');
                if (!orderId) throw new APIError(400, 'ORDER_ID_REQUIRED');
                if (!hashToken) throw new APIError(400, 'HASH_TOKEN_REQUIRED');
                const options = {
                    url: this.#getVerifySDKURI(),
                    method: 'POST',
                    data: {
                        token: this.#getSPayToken(),
                        upiId,
                        amount,
                        orderId,
                        hashToken,
                    }       
                };
                const response = await axios(options);
                return resolve({ response: response.data, token: this.#getSPayToken() });
            } catch (e) {
                return reject(e);
            }
        });
    }

    async checkStatus({ clientTxnId }) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!clientTxnId) throw new APIError(400, 'CLIENT_TXN_ID_REQUIRED');
                const options = {
                    url: this.#getCheckStatusURI(),
                    method: 'POST',
                    data: {
                        token: this.#getSPayToken(),
                        clientTxnId,
                    }       
                };
                const response = await axios(options);
                return resolve({ response: response.data, token: this.#getSPayToken() });
            } catch (e) {
                return reject(e);
            }
        });
    }

    async generateDynamicQR({ clientOrderId, amount, returnUrl }) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!clientOrderId) throw new APIError(400, 'CLIENT_ORDER_ID_REQUIRED');
                if (!amount) throw new APIError(400, 'AMOUNT_REQUIRED');
                if (!returnUrl) throw new APIError(400, 'RETURN_URL_REQUIRED');
                const options = {
                    url: this.#getGenerateDynamicQRURI(),
                    method: 'POST',
                    data: {
                        token: this.#getSPayToken(),
                        clientOrderId,
                        amount,
                        returnUrl,
                    }       
                };
                const response = await axios(options);
                return resolve({ response: response.data, token: this.#getSPayToken() });
            } catch (e) {
                return reject(e);
            }
        });
    }

    async generateStaticQR({ clientOrderId, amount, returnUrl }) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!clientOrderId) throw new APIError(400, 'CLIENT_ORDER_ID_REQUIRED');
                if (!amount) throw new APIError(400, 'AMOUNT_REQUIRED');
                if (!returnUrl) throw new APIError(400, 'RETURN_URL_REQUIRED');
                const options = {
                    url: this.#getGenerateStaticQRURI(),
                    method: 'POST',
                    data: {
                        token: this.#getSPayToken(),
                        clientOrderId,
                        amount,
                        returnUrl,
                    }       
                };
                const response = await axios(options);
                return resolve({ response: response.data, token: this.#getSPayToken() });
            } catch (e) {
                return reject(e);
            }
        });
    }

    async statusCheck({ extTransactionId }) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!extTransactionId) throw new APIError(400, 'EXT_TRANSACTION_ID_REQUIRED');
                const options = {
                    url: this.#getStatusCheckURI(),
                    method: 'POST',
                    data: {
                        token: this.#getSPayToken(),
                        extTransactionId,
                    }       
                };
                const response = await axios(options);
                return resolve({ response: response.data });
            } catch (e) {
                return reject(e);
            }
        });
    }

    //#endregion

    //#region private methods

    //#region getters and setters

    #getSPayToken() {
        return this.#spayToken;
    }

    #getVerifyUPIURI() {
        return `${this.#baseURI}${this.#verifyUPIEndPoint}`;
    }

    #getInitiateSDKURI() {
        return `${this.#baseURI}${this.#initiateSDKEndPoint}`;
    }

    #getVerifySDKURI() {
        return `${this.#baseURI}${this.#verifySDKEndPoint}`;
    }

    #getCheckStatusURI() {
        return `${this.#baseURI}${this.#checkStatusEndPoint}`;
    }

    #getGenerateDynamicQRURI() {
        return `${this.#baseURI}${this.#generateDynamicQREndPoint}`;
    }

    #getGenerateStaticQRURI() {
        return `${this.#baseURI}${this.#generateStaticQREndPoint}`;
    }

    #getStatusCheckURI() {
        return `${this.#baseURI}${this.#statusCheckEndPoint}`;
    }

    //#endregion getters and setters

    //#region helper methods

    //

    //#endregion helper methods

    //#endregion private methods
}

//#endregion

module.exports = SPayClient;