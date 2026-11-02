const { Router } = require('express');
const ctrl = require('./ctrl');
const { ROLES, roleAuthMiddleware } = require('./../authentication/middleware');
const { ADMIN, SUBSCRIBER } = ROLES;
const router = Router();

router.get('/subscriptions/plans', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.validate('handleGetPlanList'), ctrl.handleGetPlanList);

router.get('/subscriptions', roleAuthMiddleware([ADMIN]), ctrl.validate('handleListSubscription'), ctrl.handleListSubscription);

router.post('/subscriptions', roleAuthMiddleware([ADMIN]), ctrl.validate('handleCreateSubscription'), ctrl.handleCreateSubscription);

router.get(
    '/subscriptions/:subscription_id',
    roleAuthMiddleware([ADMIN]),
    ctrl.validate('handleGetSubscription'),
    ctrl.handleGetSubscription
);

router.patch(
    '/subscriptions/:subscription_id',
    roleAuthMiddleware([ADMIN]),
    ctrl.validate('handleUpdateSubscription'),
    ctrl.handleUpdateSubscription
);

router.delete(
    '/subscriptions/:subscription_id',
    roleAuthMiddleware([ADMIN]),
    ctrl.validate('handleDeleteSubscription'),
    ctrl.handleDeleteSubscription
);

router.post('/payments', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.validate('handleCreatePayment'), ctrl.handleCreatePayment);

router.get('/payments', roleAuthMiddleware([ADMIN]), ctrl.validate('handleListPayment'), ctrl.handleListPayment);

router.put('/payments/:payment_id', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.validate('handleUpdatePayment'), ctrl.handleUpdatePayment);

router.get('/payments/:payment_id', roleAuthMiddleware([ADMIN]), ctrl.validate('handleGetPayment'), ctrl.handleGetPayment);

router.delete('/payments/:payment_id', roleAuthMiddleware([ADMIN]), ctrl.validate('handleDeletePayment'), ctrl.handleDeletePayment);

router.post('/payments/token', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.validate('handleGetPaymentToken'), ctrl.handleGetPaymentToken);

router.post('/payments/token/complete', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.validate('handleCompletePaymentWithToken'), ctrl.handleCompletePaymentWithToken);

router.post('/payments/spay/verify-upi', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.validate('handleSPayVerifyUPI'), ctrl.handleSPayVerifyUPI);

router.post('/payments/spay/initiate-sdk', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.validate('handleSPayInitiateSDK'), ctrl.handleSPayInitiateSDK);

router.post('/payments/spay/verify-sdk', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.validate('handleSPayVerifySDK'), ctrl.handleSPayVerifySDK);

router.post('/payments/spay/status-check', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.validate('handleSPayStatusCheck'), ctrl.handleSPayStatusCheck);

router.post('/payments/airpay/generate-checksum', roleAuthMiddleware([ADMIN, SUBSCRIBER]), ctrl.validate('handleGenerateAirpayChecksum'), ctrl.handleGenerateAirpayChecksum);

router.post(
    '/payments/hdfc/verify-customer-vpa',
    roleAuthMiddleware([ADMIN, SUBSCRIBER]),
    ctrl.validate('handleHDFCVerifyCustomerVpa'),
    ctrl.handleHDFCVerifyCustomerVpa
);

router.post(
    '/payments/hdfc/initiate-web-collect',
    roleAuthMiddleware([ADMIN, SUBSCRIBER]),
    ctrl.validate('handleInitiateHDFCWebCollectTransaction'),
    ctrl.handleInitiateHDFCWebCollectTransaction
);

router.post(
    '/payments/hdfc/initiate-upi-intent',
    roleAuthMiddleware([ADMIN, SUBSCRIBER]),
    ctrl.validate('handleInitiateHDFCUpiIntentTransaction'),
    ctrl.handleInitiateHDFCUpiIntentTransaction
);

router.get(
    '/payments/hdfc/transaction-status',
    roleAuthMiddleware([ADMIN, SUBSCRIBER]),
    ctrl.validate('handleCheckHDFCTransactionStatus'),
    ctrl.handleCheckHDFCTransactionStatus
);

module.exports = router;