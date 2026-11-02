'use strict';

const axios = require('axios');

class NDPSAPI {

    // Test Auth URI
    authUrlTest = 'https://caller.atomtech.in/ots/aipay/auth';

    // Production Auth URI
    authUrlProd = 'https://payment1.atomtech.in/ots/aipay/auth';

    apiHeaders(api) {
        const headers = {
            'auth': {
                'cache-control': 'no-cache',
                'content-type': 'application/x-www-form-urlencoded'
            },
        };
        return headers[api];
    }
    
    /**
     * @param {number} merchantId Id of the merchant registered at NTTDataPay.
     * @param {string} encryptedData Request data encrypted using AES-256-CBC encryption algorithm.
     * 
     * @returns {Promise<string>} responseBody
     */
    async generateAtomTokenId(merchantId, encryptedData) {
        return new Promise(async (resolve, reject) => {
            try {
                const options = {
                    url: this.authUrlTest,
                    method: 'POST',
                    headers: this.apiHeaders('auth'),
                    data: {
                        merchId: merchantId,
                        encData: encryptedData,
                    }       
                };
                const response = await axios(options, );
                return resolve(response.data);
            } catch (e) {
                return reject(e);
            }
        });
    }
}

module.exports = NDPSAPI;