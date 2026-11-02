const { Router } = require('express');
const multer = require('../uploads/multer');

const router = Router();
const ctrl = require('./ctrl');

const { ROLES, roleAuthMiddleware } = require('./../authentication/middleware');
const { ADMIN, SUBSCRIBER } = ROLES;

router.get('/current-user', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.getUser);

router.post('/update', roleAuthMiddleware([ADMIN, SUBSCRIBER]), multer.single('photo'), ctrl.validate('update'), ctrl.updateUser);

router.post('/update-preferred-language', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.validate('update-language'), ctrl.updatePreferredLanguage);

router.post('/update-active/:active', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.updateActive);

router.post('/subscribe/web', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.validate('subscribe-web'), ctrl.subscribeWeb);

router.post('/unsubscribe/web', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.unsubscribeWeb);

router.post('/subscribe/mobile', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.validate('subscribe-mobile'), ctrl.subscribeMobile);

router.post('/unsubscribe/mobile', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.unsubscribeMobile);

router.post('/read-notification/:id?', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.updateNotification);

router.get('/notifications/:id?', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.getNotification);

router.delete('/delete-user/:id?', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.deleteUser)

router.get('/admin-users', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.adminGetUsers);

router.post('/subscribe', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.validate('subscribe'), ctrl.subscribe);

router.post('/unsubscribe', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.validate('subscribe'), ctrl.unsubscribe);

router.post('/change-password', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.validate('changePassword'), ctrl.changePassword);

router.post('/set-pin', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.validate('setSecurityPin'), ctrl.setSecurityPin);

router.post('/security-pin-auth', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.validate('handleSecurityPinAuth'), ctrl.handleSecurityPinAuth);

router.post('/logout', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.handleLogout);

router.post('/profile-picture', roleAuthMiddleware([ADMIN, SUBSCRIBER]), multer.single('file'), ctrl.handleAddProfilePic);

router.get('/user/subscription', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.handleGetUserSubscription)

router.get('/users', roleAuthMiddleware([ADMIN]), ctrl.handleGetUserList);

router.get('/users/:user_id', roleAuthMiddleware([ADMIN]), ctrl.validate('handleGetUser'), ctrl.handleGetUser)

router.patch('/users/:user_id/restrict', roleAuthMiddleware([ADMIN]), ctrl.validate('handleRestrictUser'), ctrl.handleRestrictUser);

router.post('/users/delete', ctrl.validate('handleDeleteUser'), ctrl.handleDeleteUser);

router.post('/users/subscriptions/add', ctrl.validate('handleAddSubscription'), ctrl.handleAddSubscription);

module.exports = router;

