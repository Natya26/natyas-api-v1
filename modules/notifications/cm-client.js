const axios = require('axios');

class CmClient {

    static getProductToken = () => process.env.CM_PRODUCT_TOKEN;
    
    static getSenderName = () => 'NAVARA';

    static send(recipient, message) {
        const headers = {
            "Content-Type": "application/json; charset=utf-8",
            "Accept": "application/json",
        };
        const data = {
            "messages": {
                "authentication": {
                    "productToken": this.getProductToken()
                },
                "msg": [
                    {
                        "from": this.getSenderName(),
                        "body": {
                            "content": message,
                            "type": "auto"
                        },
                        "to": [
                            {
                                "number": recipient
                            }
                        ],
                        "allowedChannels": [
                            "SMS"
                        ]
                    }
                ]
            }
        }
        const options = {
          method: 'POST',
          url: 'https://gw.cmtelecom.com/v1.0/message',
          headers,
          data,
        };
        
        axios
            .request(options)
            .then(function (res) {
                // console.log("CM SMS SUCCESS:", res.data);
                console.log("CM SMS SUCCESS");
            })
            .catch(function (e) {
                console.log("CM SMS ERROR:", e);
            });
    }
}

module.exports = CmClient;