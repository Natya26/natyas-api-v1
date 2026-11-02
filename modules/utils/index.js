const db = require('../db');
const { Client, Status } = require("@googlemaps/google-maps-services-js");
const client = new Client({});
const moment = require('moment');
const CryptoJS = require("crypto-js");
const APIError = require('../errors/APIError');
const crypto = require('crypto');

class Utils {
    static parseAccessToken(req) {
        const authHeader = req.header('Authorization');
        const values = authHeader.split(' ');
        return values[1];
    }
    static pageOffset(req, count) {
        const limit = req.query.limit || count;
        const page = req.query.page || 1;
        let offset = (page - 1) * limit;
        let end = parseInt(limit) + parseInt(offset);
        return { offset, limit, page, end }
    }

    static pagination(req, result) {
        let { offset, end } = this.pageOffset(req, result.length)
        return result.slice(offset, end)
    }

    static encryptData(data) {
        var ciphertext = CryptoJS.AES.encrypt((data).toString(), process.env.JWT_KEY).toString();
        return ciphertext;
    }

    static decryptData(ciphertext) {
        var bytes = CryptoJS.AES.decrypt(ciphertext, process.env.JWT_KEY);
        var data = bytes.toString(CryptoJS.enc.Utf8);
        return data;
    }

    static async generateTokenNumber(country) {
        if (!country) country = process.env.COUNTRY;
        let tokenResponse = await db.getQueryBuilder('enquiry-token').first();
        if (!tokenResponse) {
            await db.insertDoc('enquiry-token', { token: 1000 });
            tokenResponse = await db.getQueryBuilder('enquiry-token').first();
        }
        console.log(tokenResponse);
        const nextToken = tokenResponse.token + 1
        const response = await db.updateDoc('enquiry-token', tokenResponse.id, { token: nextToken });
        console.log('update response : ', response);
        const token = country + tokenResponse.token;
        console.log(token);
        return token;

    }

    static async generateWalletTxnId(userId, code) {
        let idResponse = await db.getQueryBuilder('txnid-wallet').first();
        if (!idResponse) {
            await db.insertDoc('txnid-wallet', { txnId: 10000 });
            idResponse = await db.getQueryBuilder('txnid-wallet').first();
        }
        const nextValue = idResponse.txnId + 1
        const response = await db.updateDoc('txnid-wallet', idResponse.id, { txnId: nextValue });
        const id = response.txnId;
        const append = 11 - id.toString().length
        const txnId = 'LBW' + id + userId.slice(-append).toUpperCase() + code;
        return txnId;
    }

    static statusFunction(res, now) {
        let status
        if (moment(res.auctionEnd).diff(now, 'milliseconds') < 0) {
            if (parseInt(res.count) > 0 && moment(res.scheduleStart).diff(now, 'milliseconds') > 0)
                status = 'PENDING'
            else
                status = 'CANCELLED'
        }
        else {
            if (moment(res.auctionStart).diff(now, 'milliseconds') > 0)
                status = 'NOT-STARTED'
            else
                status = 'RUNNING'
        }
        return status;
    }

    static async mapReverse(lat, long, lang = null) {
        var result = {};
        return new Promise(async resolve => {
            await client
                .reverseGeocode({
                    params: {
                        latlng: `${lat},${long}`,
                        key: process.env.GOOGLE_MAPS_API_KEY,
                        language: lang || process.env.lang
                    },
                    timeout: 1000, // milliseconds
                })
                .then((r) => {
                    // console.log(JSON.stringify(r.data))
                    if (r.data.results.length == 0) throw new APIError(400, r.data.error_message)
                    const address = r.data.results[0].address_components
                    result.address = r.data.results[0].formatted_address
                    // result.full = r.data.results[0].address_components
                    // result.location = r.data.results[0]
                    var searchField = "types";
                    for (var i = 0; i < address.length; i++) {
                        if (address[i][searchField][0] == "administrative_area_level_1") {
                            result.regionLong = address[i].long_name;
                            result.regionShort = address[i].short_name;
                        }
                        if (address[i][searchField][0] == "country") {
                            result.countryLong = address[i].long_name;
                            result.countryShort = address[i].short_name;
                        }
                        if (address[i][searchField][2] == "sublocality_level_1" || address[i][searchField][0] == "administrative_area_level_2") {
                            result.area = address[i].long_name;
                        }
                        if (address[i][searchField][0] == "route") {
                            result.route = address[i].long_name;
                        }
                        if (address[i][searchField][0] == "locality") {
                            result.locality = address[i].long_name;
                        }
                    }
                    db.getQueryBuilder('flag')
                        .where({ country_code: result.countryShort, language: process.env.lang })
                        .first().then(flag => {
                            if (!flag || !flag.image) result.flag = null
                            else result.flag = flag.image
                            resolve(result)
                        })
                        .catch(e => {
                            throw e
                        })
                    // if (flag != undefined)
                    //     result.flag = flag.image;
                })
                .catch((e) => {
                    result = null
                    resolve(result)
                })
            // resolve(result);
        })
    }

    static asymmetricEncrypt(data) {
        return crypto.publicEncrypt({
            key: process.env.ENCRYPTION_PUB_KEY,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
        }, Buffer.from(data));
    }

    static asymmetricDecrypt(data) {
        return crypto.privateDecrypt({
            key: process.env.ENCRYPTION_PRI_KEY,
            passphrase: process.env.ENCRYPTION_PRI_KEY_PASS,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        }, data);
    }
}
module.exports = Utils;
