const { body, validationResult, query } = require("express-validator");
const { apiFmt } = require("../services/fmt");
const ApplicationMetadata = require('./application-metadata');
const APIError = require("../errors/APIError");

let handlers = {};
const applicationMetadataClient = new ApplicationMetadata();

function validate(method) {
    switch (method) {
        case 'handleAddMerchantUPIId': {
            return [
                body('upiId').exists().notEmpty().isString(),
            ];
        }
        case 'handleAddApkInfo': {
            return [
                body('versionCode').exists().notEmpty().isNumeric(),
                body('versionName').exists().notEmpty().isString(),
                body('isMandatory').exists().notEmpty().isBoolean(),
            ];
        }
        case 'handleGetApplicationVersion': {
            return [
                query('platform').exists().notEmpty().isString().isIn(['android', 'ios']),
            ];
        }

        default: {
            return [];
        }
    }
}

function validateReq(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new APIError(400, "Invalid request", errors);
}

handlers.validate = validate;

handlers.handleAddMerchantUPIId = async (req, res, next) => {
    try {
        validateReq(req);
        const result = await applicationMetadataClient.addMerchantUPIId(req.body);
        return res.json(apiFmt(result, 'MERCHANT_UPI_ID_ADDED'));
    } catch (e) {
        console.log('handleAddMerchantUPIId --- ERROR ', e);
        return next(e);
    }
}

handlers.handleAddApkInfo = async (req, res, next) => {
    try {
        validateReq(req);
        const result = await applicationMetadataClient.addApkInfo(req.body);
        return res.json(apiFmt(result, 'APK_INFO_ADDED'));
    } catch (e) {
        console.log('handleAddApkInfo --- ERROR ', e);
        return next(e);
    }
}

handlers.handleGetMerchantUPIId = async (req, res, next) => {
    try {
        validateReq(req);
        const result = await applicationMetadataClient.getMerchantUPIId();
        return res.json(apiFmt(result, 'MERCHANT_UPI_ID'));
    } catch (e) {
        console.log('handleGetMerchantUPIId --- ERROR ', e);
        return next(e);
    }
}

handlers.handleGetApplicationVersion = async (req, res, next) => {
    try {
        validateReq(req);
        const result = await applicationMetadataClient.getApplicationVersion(req.query);
        return res.json(apiFmt(result, 'APP_INFO'));
    } catch (e) {
        console.log('handleGetMerchantUPIId --- ERROR ', e);
        return next(e);
    }
}

handlers.handleUploadApk = async (req, res, next) => {
    try {
        // validateReq(req);
        const result = await applicationMetadataClient.uploadApkToS3(req.file);
        return res.json(apiFmt(result, 'APK_UPLOADED'));
    } catch (e) {
        console.log('handleUploadApk --- ERROR ', e);
        return next(e);
    }
}

module.exports = handlers;