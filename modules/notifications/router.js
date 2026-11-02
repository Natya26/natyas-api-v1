const Router = require('express');
const router = Router();

const ctrl = require('./ctrl');

router.post('/send-notification', ctrl.validate('handleSendNotification'), ctrl.handleSendNotification);

router.get('/notifications', ctrl.validate('handleGetNotificationList'), ctrl.handleGetNotificationList);

module.exports = router;