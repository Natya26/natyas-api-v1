const { Router } = require('express');
const router = Router();
const ctrl = require('./ctrl')

router.post('/signup', ctrl.validate('signup'), ctrl.signup);

router.post('/login', ctrl.validate('login'), ctrl.login);

router.post('/social-login', ctrl.validate('social'), ctrl.socialLogin);

router.post('/verify/phone', ctrl.validate('verify_phone'), ctrl.verifyPhoneNumber, ctrl.login);

router.post('/verify/email/send', ctrl.sendEmailVerification);

router.post('/verify/phone/send', ctrl.sendSmsVerification);

router.post('/verify/phone/resend', ctrl.resendOTP);

router.post('/verify/email', ctrl.validate('verify_email'), ctrl.verifyEmail);

router.post('/refresh', ctrl.validate('refresh'), ctrl.refreshTokens);

router.post('/validate', ctrl.validate('validate_token'), ctrl.validateToken);

router.post('/forgot-password', ctrl.validate('forgot_password'), ctrl.forgotPassword);

router.post('/forgot-password-confirm',
    ctrl.validate('forgot_password_confirm'),
    ctrl.forgotPasswordConfirm
);

router.post('/app/signup', ctrl.validate('appSignUp'), ctrl.appSignUp);

router.post('/app/login-with-otp', ctrl.validate('loginWithOTP'), ctrl.loginWithOTP);

router.post('/app/login-with-whatsapp', ctrl.validate('loginWithWhatsapp'), ctrl.loginWithWhatsapp);


router.post('/verify-token',  ctrl.verifyOtplessToken);

module.exports = router;
