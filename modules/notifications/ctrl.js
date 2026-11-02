const { body, param, validationResult, query } = require("express-validator");
const APIError = require("../errors/APIError");
const { apiFmt } = require("../services/fmt");
const { EventEmitter } = require('./../events/event');
const NotificationClient = require('./notifications');
const _db = require('./../db');

const handleSendNotification = async (req, res, next) => {
    try {
        validateReq(req);
        const { type, contents } = req.body;
        EventEmitter.emit('TEST', { type: type, contents: contents });
        return res.json(apiFmt(null, 'SUCCESS'));
    } catch (e) {
        console.log('handleSendNotification --- ERROR', e);
        next(e);
    }
};

const handleGetNotificationList = async (req, res, next) => {
    try {
        validateReq(req);
        let response = {};
        const { hasPagination, limit, offset } = pagination(req.query.page, req.query.page_length);
        const query = NotificationClient.getNotification();
        const countQuery = _db.getQueryBuilder('notifications')
            .where('active', true)
            .count('id');
        query.orderBy('created_at', req.query.order ? req.query.order : 'DESC');
        if (req.query.userId) {
            query.where('type', '!=', 'SUBCRIPTION');
            countQuery.where('type', '!=', 'SUBCRIPTION');
            query.orWhere(qry => {
                qry
                    .where('type', 'SUBCRIPTION')
                    .where(_db.knexDB.raw("details->>'notification_id' = ?", req.query.userId));
            });
            countQuery.where(qry => {
                qry
                    .where('type', 'SUBCRIPTION')
                    .where(_db.knexDB.raw("details->>'notification_id' = ?", req.query.userId));
            });
        }
        if (hasPagination) {
            response.page = Number(req.query.page);
            response.page_length = Number(req.query.page_length);
            query
                .offset(offset)
                .limit(limit);
        }
        const countResult = await countQuery;
        const result = await query;
        response.total = Number(countResult[0].count);
        if (!req.query.page) {
            response.page = 1;
            response.page_length = response.total;
        }
        response.items = result;
        return res.json(apiFmt(response, 'SUCCESS'));
    } catch (e) {
        console.log('handleGetNotificationList --- ERROR', e);
        next(e);
    }
};

function pagination(page, length) {
    let result = {
        hasPagination: false,
        limit: undefined,
        offset: 0,
    };
    if (!page) return result;
    if (!length) return result;
    page = Number(page);
    length = Number(length);
    const offset = (page - 1) * length;
    result.offset = offset;
    result.limit = length;
    result.hasPagination = true;
    return result;
}

function validate(method) {

    switch (method) {
        case 'handleSendNotification': {
            return [
                body('type').exists().notEmpty().isString().trim().escape(),
                body('contents').exists().notEmpty().isObject(),
                body('contents.en').exists().notEmpty().isString().trim().escape(),
            ];
        }
        case 'handleGetNotificationList': {
            return [
                query('page').optional({ nullable: true }).notEmpty().isNumeric().trim().escape(),
                query('page_length').optional({ nullable: true }).notEmpty().isNumeric().trim().escape(),
                query('userId').optional({ nullable: true }).notEmpty().isString().trim().escape(),
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

module.exports = {
    handleGetNotificationList,
    handleSendNotification,
    validate,
};