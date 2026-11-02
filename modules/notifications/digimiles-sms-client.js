const axios = require('axios');
const config = require('../config/digimiles.config');

class DigiMilesClient {

    static config = () => config;
    
    static getOtpMessage = (name, otp) => `Hi ${name}, Your Navarasa login code is: ${otp} -NAVARASA`;

    static send(recipient, message) {
        const params = {
            username    : this.config().userName,
            password    : this.config().password,
            type        : this.config().type,
            dlr         : this.config().dlr,
            destination : recipient,
            source      : this.config().source,
            message     : message,
            entityid    : this.config().entityId,
            tempid      : this.config().templateId,
            tmid        : this.config().tmid,
        }
        const options = {
          method: 'POST',
          url: 'https://rslri.connectbind.com:8443/bulksms/bulksms',
          params,
        };
        
        axios
            .request(options)
            .then(function (res) {
                console.log("DIGIMILES SMS SUCCESS", res.data);
            })
            .catch(function (e) {
                console.log("DIGIMILES SMS ERROR:", e);
            });
    }
}

module.exports = DigiMilesClient;