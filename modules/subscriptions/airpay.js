'use strict';
const { createHash } = require('node:crypto');
const CRC32 = require('crc-32');
const moment = require('moment');
const config = require('./../config/airpay.config');

class Airpay {
    constructor() {}

    createChecksum({
        email    : buyerEmail,
        firstName: buyerFirstName,
        lastName : buyerLastName,
        orderId  : orderid,
        phoneNumber,
        amount
    }) {
        const response = {
            orderid,
            buyerFirstName,
            buyerLastName,
            buyerEmail,
            amount,
            isocurrency : 'INR',
            currency    : 356,
            buyerPhone  : !phoneNumber ? '' : phoneNumber,
            buyerAddress: '',
            buyerCity   : '',
            buyerState  : '',
            buyerCountry: '',
            buyerPinCode: '',
            customvar   : '',
            txnsubtype  : '',
            chmod       : '',
            checksum    : '',
            mercid      : '',
            privatekey  : '',
        };

        const {
            userName, password, secret, mid
        } = config;
        const privateKey      = createHash('sha256').update(`${secret}@${userName}:|:${password}`).digest('hex');
        const keySha256       = createHash('sha256').update(`${userName}~:~${password}`).digest('hex');
        const checksumDataStr = `${response.buyerEmail}${response.buyerFirstName}${response.buyerLastName}${response.buyerAddress}${response.buyerCity}${response.buyerState}${response.buyerCountry}${response.amount}${response.orderid}${moment(new Date()).format('YYYY-MM-DD')}`;
        const checksum        = createHash('sha256').update(`${keySha256}@${checksumDataStr}`).digest('hex');

        response.checksum   = checksum;
        response.privatekey = privateKey;
        response.mercid     = mid;

        return response;
    }

    processResponse(data) {
        const {
            userName, password, secret, mid
        } = config;
        let txnhash     = CRC32.str(
            data.TRANSACTIONID
            +':'+
            data.APTRANSACTIONID
            +':'+
            data.AMOUNT
            +':'+
            data.TRANSACTIONSTATUS
            +':'+
            data.MESSAGE
            +':'+
            mid+
            ':'+
            userName
        );
        let channel     = data.CHMOD;
        let customerVPA = data.CUSTOMERVPA;
        if (channel     == 'upi') {
            txnhash     = CRC32.str(
                data.TRANSACTIONID
                +':'+
                data.APTRANSACTIONID
                +':'+
                data.AMOUNT
                +':'+
                data.TRANSACTIONSTATUS
                +':'+
                data.MESSAGE
                +':'+
                mid
                +':'+
                userName
                +':'+
                customerVPA
            );
        }
        txnhash         = txnhash>>>0;
        const response  = {
            txnhash,
            airpayResponse: data,
        };
        return response;
    }
}

module.exports = Airpay;