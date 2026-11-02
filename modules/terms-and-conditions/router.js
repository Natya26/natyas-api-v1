const { Router } = require('express');
const ctrl = require('./ctrl');
const multer = require('./../uploads/multer');
const router = Router();

router.get('/policies/:type', ctrl.validate('handleGetPolicy'), ctrl.handleGetPolicy);

router.get('/support', ctrl.handleGetSupportForm);

router.post('/support', multer.none(), ctrl.handleSupportForm);

module.exports = router;