const { Router } = require('express');
const ctrl = require('./ctrl');
const { ROLES, roleAuthMiddleware } = require('./../authentication/middleware');
const { ADMIN, SUBSCRIBER } = ROLES;
const router = Router();

router.post('/subscription-plans', roleAuthMiddleware([ADMIN]), ctrl.validate('handleCreatePlan'), ctrl.handleCreatePlan);

router.put('/subscription-plans/:plan_id', roleAuthMiddleware([ADMIN]), ctrl.validate('handleUpdatePlan'), ctrl.handleUpdatePlan);

router.get('/subscription-plans/:plan_id', roleAuthMiddleware([ADMIN]), ctrl.validate('handleGetPlan'), ctrl.handleGetPlan);

router.get('/subscription-plans', roleAuthMiddleware([ADMIN]), ctrl.validate('handleGetPlanList'), ctrl.handleGetPlanList);

router.delete('/subscription-plans/:plan_id', roleAuthMiddleware([ADMIN]), ctrl.validate('handleDeletePlan'), ctrl.handleDeletePlan);

module.exports = router;