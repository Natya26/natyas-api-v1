const path = require('path');
const { param, validationResult } = require('express-validator');
const APIError = require('./../errors/APIError');
const { apiFmt } = require('./../services/fmt');

const handleGetPolicy = async (req, res, next) => {
    try {
        validateReq(req);
        let filePath = null;
        const { type } = req.params;
        switch (type) {
            case 'terms-and-conditions':
                filePath = path.resolve(__dirname, '../../public/views/terms-and-conditions.html');
                break;
            case 'refund-policy':
                filePath = path.resolve(__dirname, '../../public/views/refund-policy.html');
                break;
            case 'privacy-policy':
                filePath = path.resolve(__dirname, '../../public/views/privacy-policy.html');
                break;
        
            default:
                throw new APIError(404, 'Requested Resource Not Found');
        }
        return res.sendFile(filePath);
    } catch (e) {
        console.log('handleGetPolicy --- Error', e);
        next(e);
    }
}

const handleGetSupportForm = async (req, res, next) => {
    try {
        filePath = path.resolve(__dirname, '../../public/views/support.html');
        res.sendFile(filePath);
    } catch (e) {
        console.log('handleGetSupportForm --- ERROR', e);
        next(e);
    }
}

const handleSupportForm = async (req, res, next) => {
    try {
        console.log('SUPPORT FORM', req.body);
        filePath = path.resolve(__dirname, '../../public/views/support-form-success.html');
        res.sendFile(filePath);
        // res.json(apiFmt({ reqBody: req.body }, 'SUCCESS'));        
    } catch (e) {
        console.log('handleSupportForm --- ERROR', e);
        next(e);
    }
}

function validateReq(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new APIError(400, "Invalid request", errors);
}

function validate(method) {

    switch (method) {
        case 'handleGetPolicy': {
            return [
                param('type').exists().notEmpty().isIn(['terms-and-conditions', 'refund-policy', 'privacy-policy']),
            ];
        }
        default: {
            return [];
        }
    }
}

module.exports = {
    handleGetPolicy,
    handleGetSupportForm,
    handleSupportForm,
    validate,
};