const { Router } = require('express');
const ctrl = require('./ctrl');
const { ROLES, roleAuthMiddleware } = require('./../authentication/middleware');
const multer = require('../uploads/multer');

const { ADMIN, SUBSCRIBER } = ROLES;
const router = Router();
const prefix = '/settings';


router.post(
    prefix + '/add-merchant-upi-id',
    roleAuthMiddleware([ADMIN]),
    ctrl.validate('handleAddMerchantUPIId'),
    ctrl.handleAddMerchantUPIId
);

router.post(
    prefix + '/add-apk-info',
    roleAuthMiddleware([ADMIN]),
    ctrl.validate('handleAddApkInfo'),
    ctrl.handleAddApkInfo
);

router.get(
    prefix + '/get-apk-info',
    roleAuthMiddleware([ADMIN]),
    ctrl.validate('handleGetApplicationVersion'),
    ctrl.handleGetApplicationVersion
);

router.get(
    prefix + '/get-merchant-upi-id',
    roleAuthMiddleware([ADMIN]),
    ctrl.validate('handleGetMerchantUPIId'),
    ctrl.handleGetMerchantUPIId
);

router.post(
    prefix + '/upload-apk',
    roleAuthMiddleware([ADMIN]),
    ctrl.validate('handleUploadApk'),
    multer.single('file'),
    ctrl.handleUploadApk
);

module.exports = router;