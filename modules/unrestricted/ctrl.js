const path = require('path');
const { param, validationResult } = require('express-validator');
const APIError = require('../errors/APIError');
const db = require('../db');
const { apiFmt } = require('../services/fmt');
const { getFile } = require('../s3');
const PaymentClient = require('../subscriptions/payment');
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY_TEST;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY_TEST;
const AtomEncryption = require('./../subscriptions/atom-encryption');
const ApplicationMetadata = require('./../settings/application-metadata');
// const AirpayClient = require('./../subscriptions/airpay');

async function getLabel(req, res, next) {
    try {
        const { id } = req.params;
        const language = req.header('Accept-Language') || 'en';
        const { language_index, all_lang } = req.query;
        let response;
        var search = req.query.search || '';
        var whereCondition = {};
        whereCondition = { 'l.language_index': language_index }
        Object.keys(whereCondition).forEach(key => whereCondition[key] === undefined && delete whereCondition[key])
        if (id) {
            let query = db.getQueryBuilder('labels').where({ id }).first()
            response = await db.executeQuery(query);
            if (!response) throw new APIError(404, 'label not Found');
        } else {
            const size = req.query.size || 'ALL';
            const from = req.query.from || 0;
            let categories = req.query.categories;
            let labelsQuery = db.getQueryBuilder('labels as l')
                .select('l.id', 'l.language', 'l.language_index', 'l.language_label', 'lan.language as language_name')
                .where('l.language_index', 'ilike', `%${search}%`)
                .andWhere(whereCondition)
                .whereRaw(`l.language=lan.language_code`)
                .leftJoin('language as lan', function () {
                    this.on('lan.language_code', '=', 'l.language')
                })
                .limit(size).offset(from);
            if (categories == 'true') labelsQuery = labelsQuery
                .whereIn('language_index', ['rental-goods', 'rental-heavy', 'rental-others', 'transport-goods', 'transport-public'])
            if (!all_lang) labelsQuery = labelsQuery.where({ 'l.language': language })
            const labels = await db.executeQuery(labelsQuery);
            response = {
                total: labels.length,
                labels: labels
            }
        }
        res.json(apiFmt(response));
    } catch (e) {
        next(e);
    }
}

async function authenticatePusher(req, res, next) {
    try {
        const socketId = req.query.socket_id || req.body.socket_id;
        const channel = req.query.channel_name || req.body.channel_name;
        let callback = req.query.callback || req.body.callback;
        console.log(req.body)
        console.log(req.query)
        let pusher = await pusherClient();
        const auth = pusher.authenticate(socketId, channel);
        console.log(auth)
        const cb = callback.replace(/\"/g, "") + "(" + JSON.stringify(auth) + ");";
        res.set({
            "Content-Type": "application/javascript"
        });
        console.log(cb)
        res.send(cb);
    } catch (e) {
        next(e)
    }
};

async function getLabelByIndex(req, res, next) {
    try {
        const { language_index } = req.params;
        const language = req.header('Accept-Language') || 'en';
        let response;
        const query = db.getQueryBuilder('labels')
            .where({ language_index, language })
            .first();
        response = await db.executeQuery(query);
        if (!response) throw new APIError(404, 'label not Found');
        res.json(apiFmt(response));
    } catch (e) {
        next(e);
    }
}

async function getLanguage(req, res, next) {
    try {
        const { id } = req.params;
        let response;
        if (id) {
            const query = db.getQueryBuilder('language')
                .where({ id })
                .first();
            response = await db.executeQuery(query);
            if (!response) throw new APIError(404, 'language not Found');
        }
        else {
            const size = req.query.size || 'ALL';
            const from = req.query.from || 0;
            const countQuery = db.getQueryBuilder('language')
            const count = await db.getCount(countQuery);
            const languageQuery = db.getQueryBuilder('language')
                .limit(size).offset(from);
            const language = await db.executeQuery(languageQuery);
            response = {
                total: count,
                language: language
            }
        }
        res.json(apiFmt(response));
    } catch (e) {
        next(e);
    }
}

async function getLanguageByCode(req, res, next) {
    try {
        const { language_code } = req.params;
        let response;
        const query = db.getQueryBuilder('language')
            .where({ language_code })
            .first();
        response = await db.executeQuery(query);
        if (!response) throw new APIError(404, 'language not Found');
        res.json(apiFmt(response));
    } catch (e) {
        next(e);
    }
}
async function getCountryFlag(req, res, next) {
    try {
        const { id } = req.params;
        const language = req.header('Accept-Language') || 'en';
        console.log(language)
        let response;
        if (id) {
            const query = db.getQueryBuilder('flag')
                .where({ id, language })
                .first();
            response = await db.executeQuery(query);
            if (!response) throw new APIError(404, 'countryFlag not Found');
        }
        else {
            let whereCondition = {};
            const size = req.query.size || 'ALL';
            const from = req.query.from || 0;
            var { country_code } = req.query;
            whereCondition = { country_code, language }
            Object.keys(whereCondition).forEach(key => whereCondition[key] === undefined && delete whereCondition[key])

            const countQuery = db.getQueryBuilder('flag')
                .where(whereCondition);
            const count = await db.getCount(countQuery);
            console.log(count)
            const countryFlagQuery = db.getQueryBuilder('flag')
                .where(whereCondition)
                .limit(size).offset(from).orderBy('country_name', 'asc');
            const countryFlag = await db.executeQuery(countryFlagQuery);
            response = {
                total: count,
                countryFlag: countryFlag
            }
        }
        res.json(apiFmt(response));
    } catch (e) {
        next(e);
    }
}
async function handleGetUserProfilePic(req, res, next) {
    try {
        validateRequest(req);
        const { user_id, image_name } = req.params;
        const s3Key = `${user_id}/profile/${image_name}`;
        const data = await getFile(s3Key);
        res.set({
            'Content-Type': 'image/png',
            'Content-Length': data.ContentLength
        });
        res.send(data.Body);
    } catch (e) {
        next(e);
    }
}
async function handleGetVideoPoster(req, res, next) {
    try {
        validateRequest(req);
        const { video_id, image_name } = req.params;
        const s3Key = `videos/${video_id}/poster/${image_name}`;
        const data = await getFile(s3Key);
        res.set({
            'Content-Type': 'image/png',
            'Content-Length': data.ContentLength
        });
        res.send(data.Body);
    } catch (e) {
        next(e);
    }
}
async function handleGetSeriesPoster(req, res, next) {
    try {
        validateRequest(req);
        const { series_id, image_name } = req.params;
        const s3Key = `series/${series_id}/poster/${image_name}`;
        const data = await getFile(s3Key);
        res.set({
            'Content-Type': 'image/png',
            'Content-Length': data.ContentLength
        });
        res.send(data.Body);
    } catch (e) {
        next(e);
    }
}

const handleRazorpayPayment = async (req, res, next) => {
    try {
        response = [];
        let status = true;
        const request = req.body;
        if( request.entity == 'event' ){
            switch (request.event) {
                case 'payment.captured':
                    // dump('captured');
                    status = await PaymentClient.razorpayPaymentCapture(request.payload);
                    break;
                case 'payment.failed':
                    // dump('failed');
                    status = await PaymentClient.razorpayPaymentFailed(request.payload);
                    break;
            }
        }
        return res.json(['ok']);
    } catch (e) {
        console.log('handleRazorpayPayment --- ERROR', e);
        return res.json(['ok']);
        next(e);
    }
}

const handleStripePayment = async (req, res, next) => {
    try {
        // const stripe = require('stripe')(STRIPE_SECRET_KEY);
        // const endpointSecret = 'whsec_b20e06b5d81cc1897c62b8f7f1e77c85d5e18c51db6f608ad181ac0a3cc23f35';
        // const sig = req.headers['stripe-signature'];
        // const event = stripe.webhooks.constructEvent(JSON.stringify(req.body), sig, endpointSecret);

        const event = req.body;
        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentSuccessIntent = event.data.object;
                await PaymentClient.stripePaymentSucceeded(paymentSuccessIntent);
                break;
            case 'payment_intent.failed':
                const paymentFailIntent = event.data.object;
                await PaymentClient.stripePaymentFailed(paymentFailIntent);
                break;
            default:
                console.log(`Unhandled event type ${event.type}.`);
        }
        return res.status(200).json({received: true});
    } catch (e) {
        console.log(`Webhook Error: ${e.message}`);
        return res.status(200).json({received: true});
        next(e);
    }
}

async function handleGetDefaultImages(req, res, next) {
    try {
        validateRequest(req);
        const { filename } = req.params;
        const s3Key = `default-images/${filename}`;
        const data = await getFile(s3Key);
        res.set({
            'Content-Type': 'image/png',
            'Content-Length': data.ContentLength
        });
        res.send(data.Body);
    } catch (e) {
        next(e);
    }
}
async function handleGetNotificationImages(req, res, next) {
    try {
        validateRequest(req);
        const { filename } = req.params;
        const s3Key = `notification-images/${filename}`;
        const data = await getFile(s3Key);
        res.set({
            'Content-Type': 'image/png',
            'Content-Length': data.ContentLength
        });
        res.send(data.Body);
    } catch (e) {
        next(e);
    }
}

function validateRequest(req) {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        throw new APIError(400, "Invalid request", errors);
    }
}

async function handleGetSeriesImage(req, res, next) {
    try {
        validateRequest(req);
        const { series_id, image_name } = req.params;
        
        const s3Key = `series/${series_id}/images/${image_name}`;
        const data = await getFile(s3Key);
        res.set({
            'Content-Type': 'image/png',
            'Content-Length': data.ContentLength
        });
        res.send(data.Body);
    } catch (e) {
        next(e);
    }
}

async function handleGetVideoImage(req, res, next) {
    try {
        validateRequest(req);
        const { video_id, image_name } = req.params;
        const s3Key = `videos/${video_id}/images/${image_name}`;
        const data = await getFile(s3Key);
        res.set({
            'Content-Type': 'image/png',
            'Content-Length': data.ContentLength
        });
        res.send(data.Body);
    } catch (e) {
        next(e);
    }
}

const getPaymentPage = async (req, res, next) => {
    try {
        const { token } = req.query;
        if (!token) return res.json(apiFmt(400, 'Invalid Token.'));
        const {
            atomTokenId, txnId, mercId, custId, custEmail, custPhoneCode, custPhone, cost, planName
        } = await PaymentClient.validateNDPSToken(token);
        console.log({
            atomTokenId, txnId, mercId, custId, custEmail, custPhoneCode, custPhone, cost, planName
        });
        req.app.engine('html', require('ejs').renderFile);
        req.app.set('view engine', 'html');
        req.app.set('views', path.join(__dirname, '../../public/views/'));
        return res.render('payment.html', { atomTokenId, txnId, mercId, custId, custEmail, custPhoneCode, custPhone, cost, planName });
    } catch (e) {
        console.log('getPaymentPage --- ERROR', e);
        req.app.engine('html', require('ejs').renderFile);
        req.app.set('view engine', 'html');
        req.app.set('views', path.join(__dirname, '../../public/views/'));
        return res.render('payment-error.html', { message: e.message });
    }
}

async function handleNDPSPaymentCallback(req, res, next) {
    try {
        let data = (new AtomEncryption()).decrypt(req.body.encData);
        console.log(JSON.parse(data));
        data = JSON.parse(data);
        let result;
        if (
            data?.payInstrument?.responseDetails?.statusCode &&
            data.payInstrument.responseDetails.statusCode == "OTS0000"
        ) {
            
            result = { view, payload } = await PaymentClient.ndpsPaymentSucceeded(data);
        } else if (
            data?.payInstrument?.responseDetails?.statusCode &&
            data.payInstrument.responseDetails.statusCode != "OTS0000"
        ) {

            result = { view, payload } = await PaymentClient.ndpsPaymentFailed(data);
        }
        req.app.engine('html', require('ejs').renderFile);
        req.app.set('view engine', 'html');
        req.app.set('views', path.join(__dirname, '../../public/views/'));
        return res.render(result.view, result.payload);     
    } catch (e) {
        console.log('handleNDPSPaymentCallback --- ERROR', e);
        req.app.engine('html', require('ejs').renderFile);
        req.app.set('view engine', 'html');
        req.app.set('views', path.join(__dirname, '../../public/views/'));
        return res.render('payment-error.html', { message: e.message });
    }
}

async function handleGetApk(req, res, next) {
    try {
        // validateRequest(req);
        // const { series_id, image_name } = req.params;
        const { apk_s3_key } = await (new ApplicationMetadata()).getApkS3Key();
        if (!apk_s3_key) throw new APIError(400, )
        const data = await getFile(apk_s3_key);
        res.set({
            'Content-Type': 'application/vnd.android.package-archive',
            'Content-Length': data.ContentLength,
            'Content-Disposition': 'attachment; filename="Navarasa.apk"',
        });
        res.send(data.Body);
    } catch (e) {
        next(e);
    }
}

async function handleSPayPaymentCallback(req, res, next) {
    try {
        const event = req.body;
        // Handle the event
        const { npciTxnId, txnid:orderId } = event;
        const paymentDetail = await PaymentClient.getPayment().where('payment_intent_id', orderId);
        if ( npciTxnId && !paymentDetail.utr ) {
            await PaymentClient.updatePayment(paymentDetail.id, { utr: npciTxnId });
        }
        switch (event.status) {
            case 'success':
                await PaymentClient.spayPaymentSucceeded(event);
                break;
            case 'pending':
                await PaymentClient.spayPaymentPending(event);
                break;
            case 'failed':
                await PaymentClient.spayPaymentFailed(event);
            break;
            default:
                console.log(`Unhandled event type ${event.type}.`);
        }
        return res.status(200).json({received: true});
    } catch (e) {
        console.log(`Webhook Error: ${e.message}`, e);
        return res.status(200).json({received: true});
        next(e);
    }
}
async function handlePayBuzzPaymentCallback(req, res, next) {
    try {
        const event = req.body;
        // Handle the event
        return res.status(200).json({received: true});
        console.log('Received data:', event);
    } catch (e) {
        console.log(`Webhook Error: ${e.message}`, e);
        return res.status(200).json({received: true});
        next(e);
    }
}
async function handleAirpayPaymentResponse(req, res, next) {
    try {
        const { body:data } = req;
        const { isValid } = await PaymentClient.processAirpayResponse(data);

        if ( !isValid ) throw new APIError(400, 'INVALID_TRANSACTION');
        
        req.app.engine('html', require('ejs').renderFile);
        req.app.set('view engine', 'html');
        req.app.set('views', path.join(__dirname, '../../public/views/'));

        return res.render('airpay-response.html', data);     
    } catch (e) {
        console.log(`Webhook Error: ${e.message}`, e);
        return res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Airpay Response : Controller Error</title>
        </head>
        <body>
        <h1>${e.message}</h1>
        </body>
        </html>
        `);
    }
}

async function handleAirpayPaymentIPN(req, res, next) {
    try {
        const { body:data } = req;
        const result = await PaymentClient.processAirpayIPN(data);        
        return res.json({ recieved: true });
    } catch (e) {
        console.log(`Webhook Error: ${e.message}`);
        return res.status(200).json({ recieved: true });
    }
}

async function handleHDFCTransactionCallBack(req, res, next) {
    try {
        const { body:data } = req;
        const result = await PaymentClient.handleHDFCTransactionCallBack(data);        
        return res.status(200).json({ recieved: true });
    } catch (e) {
        console.log(`HDFC Webhook Error: ${e.message}`);
        return res.status(200).json({ recieved: true });
    }
}

function validate(method) {
    switch (method) {
        case 'handleGetUserProfilePic': {
            return [
                param('user_id', 'Invalid User ID').exists().notEmpty().custom((value) => {
                    if (value === ':user_id') throw new Error('Invalid User ID');
                    return true;
                }).isString(),
                param('image_name', 'Invalid Image Name').exists().notEmpty().custom((value) => {
                    if (value === ':image_name') throw new Error('Invalid User ID');
                    return true;
                }).isString()
            ];
        }
        case 'handleGetVideoPoster': {
            return [
                param('video_id', 'Invalid Video ID').exists().notEmpty().custom((value) => {
                    if (value === ':video_id') throw new Error('Invalid Video ID');
                    return true;
                }).isString(),
                param('image_name', 'Invalid Image Name').exists().notEmpty().custom((value) => {
                    if (value === ':image_name') throw new Error('Invalid User ID');
                    return true;
                }).isString()
            ];
        }
        case 'handleGetSeriesPoster': {
            return [
                param('series_id', 'Invalid Series ID').exists().notEmpty().custom((value) => {
                    if (value === ':series_id') throw new Error('Invalid Series ID');
                    return true;
                }).isString(),
                param('image_name', 'Invalid Image Name').exists().notEmpty().custom((value) => {
                    if (value === ':image_name') throw new Error('Invalid User ID');
                    return true;
                }).isString()
            ];
        }
        case 'handleGetSeriesImage': {
            return [
                param('series_id', 'Invalid Series ID').exists().notEmpty().custom((value) => {
                    if (value === ':series_id') throw new Error('Invalid Series ID');
                    return true;
                }).isString(),
                param('image_name', 'Invalid Image Name').exists().notEmpty().custom((value) => {
                    if (value === ':image_name') throw new Error('Invalid User ID');
                    return true;
                }).isString()
            ];
        }
        case 'handleGetVideoImage': {
            return [
                param('video_id', 'Invalid Video ID').exists().notEmpty().custom((value) => {
                    if (value === ':video_id') throw new Error('Invalid Video ID');
                    return true;
                }).isString(),
                param('image_name', 'Invalid Image Name').exists().notEmpty().custom((value) => {
                    if (value === ':image_name') throw new Error('Invalid User ID');
                    return true;
                }).isString()
            ];
        }
        default: {
            return [];
        }
    }
}

module.exports = {
    getLabel,
    getLabelByIndex,
    getLanguage,
    getLanguageByCode,
    getCountryFlag,
    authenticatePusher,
    handleGetUserProfilePic,
    handleRazorpayPayment,
    handleStripePayment,
    validate,
    handleGetApk,
    handleGetVideoImage,
    handleGetVideoPoster,
    handleGetSeriesImage,
    handleGetSeriesPoster,
    handleGetDefaultImages,
    handleNDPSPaymentCallback,
    getPaymentPage,
    handleSPayPaymentCallback,
    handleAirpayPaymentResponse,
    handleAirpayPaymentIPN,
    handleHDFCTransactionCallBack,
    handleGetNotificationImages,
    handlePayBuzzPaymentCallback
}
