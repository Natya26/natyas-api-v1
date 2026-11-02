const { Router } = require('express');
const router = Router();
const ctrl = require('./ctrl')

router.get('/hello-world', ctrl.sendHelloWorldResponse);
router.post('/contact-us', ctrl.validate('contact-us'),ctrl.contactUs);
router.get('/contact-us/:id?', ctrl.contactUsGet);

module.exports = router;