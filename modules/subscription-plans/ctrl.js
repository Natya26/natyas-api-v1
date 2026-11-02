const { body, query, validationResult, param } = require('express-validator');
const { apiFmt } = require('../services/fmt');
const APIError = require('../errors/APIError');
const SubscriptionPlanClient = require('./subscriptionPlan');

const handleCreatePlan = async (req, res, next) => {
    try {
        validateReq(req);
        const plan = await SubscriptionPlanClient.createPlan(req.body);
        return res.json(apiFmt(plan, 'SUCCESS'));
    } catch (e) {
        console.log('handleCreatePlan --- ERROR', e);
        next(e);
    }
}

const handleUpdatePlan = async (req, res, next) => {
    try {
        validateReq(req);
        const plan = await SubscriptionPlanClient.updatePlan(req.params.plan_id, req.body);
        return res.json(apiFmt(plan, 'SUCCESS'));
    } catch (e) {
        console.log('handleCreatePlan --- ERROR', e);
        next(e);
    }
}

const handleGetPlan = async (req, res, next) => {
    try {
        validateReq(req);
        const plan = await SubscriptionPlanClient.getPlan(req.params.plan_id)
            .where('subscription_plans.active', true);
        return res.json(apiFmt(plan, 'SUCCESS'));
    } catch (e) {
        console.log('handleGetPlan --- ERROR', e);
        next(e);
    }
}

const handleGetPlanList = async (req, res, next) => {
    try {
        let { page, page_length, order = 'DESC' } = req.query;
        page = Number(page);
        page_length = Number(page_length);
        const limit = page_length ? page_length : undefined;
        const offset = (page && page_length) ? ((page - 1) * page_length) : undefined;
        const orderBy = [
            {
                column: 'subscription_plans.created_at',
                order
            }
        ];
        const plans = await SubscriptionPlanClient.getPlanList(limit, offset, orderBy)
            .where('subscription_plans.active', true);
        return res.json(apiFmt(plans, 'SUCCESS'));
    } catch (e) {
        console.log('handleGetPlanList --- ERROR', e);
        next(e);
    }
}

const handleDeletePlan = async (req, res, next) => {
    try {
        validateReq(req);
        await SubscriptionPlanClient.deletePlan(req.params.plan_id);
        return res.json(apiFmt(null, 'SUCCESS'));
    } catch (e) {
        console.log('handleDeletePlan --- ERROR', e);
        next(e);
    }
}

function validateReq(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new APIError(400, "Invalid request", errors);
}

function validate(method) {

    switch (method) {
        case 'handleCreatePlan': {
            return [
                body('name', 'name is a required field').exists().notEmpty(),
                body('cost', 'cost is a required field').exists().notEmpty(),
                body('currency', 'currency is a required field').exists().notEmpty(),
                body('validity', 'validity is a required field').exists().notEmpty(),
                body('validity_unit', 'validity_unit is a required field').exists().notEmpty(),
                body('perks', 'perks is a required field').exists().isArray(),
            ];
        }
        case 'handleUpdatePlan': {
            return [
                param('plan_id').exists().isNumeric(),
                body('name', 'name is a required field').exists().notEmpty(),
                body('cost', 'cost is a required field').exists().notEmpty(),
                body('currency', 'currency is a required field').exists().notEmpty(),
                body('validity', 'validity is a required field').exists().notEmpty(),
                body('validity_unit', 'validity_unit is a required field').exists().notEmpty(),
                body('perks', 'perks is a required field').exists().isArray(),
            ];
        }
        case 'handleGetPlan': {
            return [
                param('plan_id').exists().isNumeric(),
            ];
        }
    
        default: {
            return [];
        }
    }
}

module.exports = {
    handleCreatePlan,
    handleDeletePlan,
    handleGetPlan,
    handleGetPlanList,
    handleUpdatePlan,
    validate,
};