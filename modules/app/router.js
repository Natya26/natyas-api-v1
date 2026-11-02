const { Router } = require('express');
const ctrl = require('./ctrl');
const { ROLES, roleAuthMiddleware } = require('./../authentication/middleware');
const { ADMIN, SUBSCRIBER } = ROLES;
const router = Router();

router.post('/app/my-list', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.validate('handleAddOrRemoveFromMyList'), ctrl.handleAddOrRemoveFromMyList);

router.get('/app/my-list', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.handleGetMyList);

router.post('/app/liked', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.validate('handleAddOrRemoveFromLikedSeries'), ctrl.handleAddOrRemoveFromLikedSeries);

router.get('/app/liked', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.handleGetLikedSeries);

router.get('/app/coming-soon', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.handleGetComingSoon);

router.get('/app/current-version', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.handleGetAppCurrentVersion)

module.exports = router;