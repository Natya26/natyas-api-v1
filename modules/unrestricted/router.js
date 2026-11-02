const { Router } = require('express');
const router = Router();
const ctrl = require('./ctrl');

/**
 *
 * @api {GET} /label/:id? Get label
 * @apiName get label
 * @apiGroup Unrestricted
 * @apiVersion  1.0.0
 *
 * @apiSuccessExample {json} Success Response:
 * 
 * 
 {
    "err": false,
    "msg": null,
    "data": {
        "total": 2,
        "labels": [
            {
                "id": 25,
                "language": "en",
                "language_index": "rental-heavy",
                "language_label": "Rental Heavy",
                "language_name": "English"
            },
            {
                "id": 23,
                "language": "ar",
                "language_index": "rental-heavy",
                "language_label": "تأجير المعدات الثقيلة",
                "language_name": "Arabic"
            }
        ]
    },
    "details": []
}
 *
 *
 */
router.get('/label/:id?', ctrl.getLabel);
/**
 *
 * @api {GET} /language/:id? Get language
 * @apiName get language
 * @apiGroup Unrestricted
 * @apiVersion  1.0.0
 *
 * @apiSuccessExample {json} Success Response:
 * 
 * 
{
    "err": false,
    "msg": null,
    "data": {
        "total": 2,
        "language": [
            {
                "id": 3,
                "language": "Arabic",
                "language_code": "ar",
                "status": "Active",
                "custom": "{\"align\":\"right\",\"direction\":\"rtl\",\"\":\"\"}",
                "created_at": "2020-05-26T18:17:40.641Z",
                "updated_at": "2020-05-26T18:17:40.641Z",
                "flag": "https://logibids-dev.s3.amazonaws.com/688b08a7-141d-49d5-854c-3300a6efcd19/files/1591005972069-bus.png"
            },
            {
                "id": 13,
                "language": "English",
                "language_code": "en",
                "status": "Active",
                "custom": "{\"\":\"\"}",
                "created_at": "2020-06-01T08:52:43.281Z",
                "updated_at": "2020-06-01T08:52:43.281Z",
                "flag": ""
            }
        ]
    },
    "details": []
}
 *
 *
 */
router.get('/language/:id?', ctrl.getLanguage);
/**
 *
 * @api {GET} /language-code/:{language_code} Get language by code
 * @apiName get language by code
 * @apiGroup Unrestricted
 * @apiVersion  1.0.0
 *
 * @apiSuccessExample {json} Success Response {ar}:
 * 
 * 
{
    "err": false,
    "msg": null,
    "data": {
        "id": 3,
        "language": "Arabic",
        "language_code": "ar",
        "status": "Active",
        "custom": "{\"align\":\"right\",\"direction\":\"rtl\",\"\":\"\"}",
        "created_at": "2020-05-26T18:17:40.641Z",
        "updated_at": "2020-05-26T18:17:40.641Z",
        "flag": "https://logibids-dev.s3.amazonaws.com/688b08a7-141d-49d5-854c-3300a6efcd19/files/1591005972069-bus.png"
    },
    "details": []
}
 *
 *
 */
router.get('/language-code/:language_code', ctrl.getLanguageByCode);

router.get('/language-index/:language_index', ctrl.getLabelByIndex); // api not in use, cause error
/**
 *
 * @api {GET} /country-flag/:id?country_code=IN Get countries flags
 * @apiName get countries flag
 * @apiGroup Unrestricted
 * @apiVersion  1.0.0
 *
 * @apiSuccessExample {json} Success Response :
 * 
 * 
{
    "err": false,
    "msg": null,
    "data": {
        "total": 1,
        "countryFlag": [
            {
                "sl_no": 7,
                "image": "https://logibids-dev.s3.amazonaws.com/91ea2355-e088-47bb-9820-34b426366ee1/files/1606293375598-india-flag.png",
                "country_code": "IN",
                "created_at": "2020-05-25T08:33:52.726Z",
                "updated_at": "2020-05-25T08:33:52.726Z",
                "id": 7,
                "country_name": "India",
                "language": "en",
                "currencyCode": "INR",
                "countryPrefix": "+91"
            }
        ]
    },
    "details": []
}
 *
 *
 */
router.get('/country-flag/:id?', ctrl.getCountryFlag);
router.get('/pusher-authenticate',  ctrl.authenticatePusher);
router.post('/pusher-authenticate',  ctrl.authenticatePusher);

/**
 *
 * @api {GET} /:user_id/profile/:image_name Get User Profile Pic
 * @apiName get user profile picture
 * @apiGroup Unrestricted
 * @apiVersion  1.0.0
 *
 * @apiSuccessExample {image/png}
 */
router.get('/:user_id/profile/:image_name', ctrl.validate('handleGetUserProfilePic'), ctrl.handleGetUserProfilePic);

/**
 *
 * @api {GET} /poster/videos/:video_id/poster/:image_name Get Video Poster
 * @apiName get video poster
 * @apiGroup Unrestricted
 * @apiVersion  1.0.0
 *
 * @apiSuccessExample {image/png}
 */
router.get('/videos/:video_id/poster/:image_name', ctrl.validate('handleGetVideoPoster'), ctrl.handleGetVideoPoster);

/**
 *
 * @api {GET} /poster/series/:series_id/poster/:image_name Get Series Poster
 * @apiName get series poster
 * @apiGroup Unrestricted
 * @apiVersion  1.0.0
 *
 * @apiSuccessExample {image/png}
 */
router.get('/series/:series_id/poster/:image_name', ctrl.validate('handleGetSeriesPoster'), ctrl.handleGetSeriesPoster);

router.post('/webhook/razorpay', ctrl.handleRazorpayPayment);

router.post('/webhook/stripe', ctrl.handleStripePayment);

router.get('/default-images/:filename', ctrl.handleGetDefaultImages);

router.get('/series/:series_id/images/:image_name', ctrl.validate('handleGetSeriesImage'), ctrl.handleGetSeriesImage);

router.get('/videos/:video_id/images/:image_name', ctrl.validate('handleGetVideoImage'), ctrl.handleGetVideoImage);

router.get('/proceed-to-payment', ctrl.getPaymentPage);

router.post('/webhook/ndps', ctrl.handleNDPSPaymentCallback);

router.post('/webhook/spay', ctrl.handleSPayPaymentCallback);

router.post('/airpay/response', ctrl.handleAirpayPaymentResponse);

router.post('/webhook/airpay', ctrl.handleAirpayPaymentIPN);

router.post('/webhook/hdfc', ctrl.handleHDFCTransactionCallBack);

router.post('/webhook/paybuzz', ctrl.handlePayBuzzPaymentCallback);


/**
 *
 * @api {GET} /download/apk Get Apk
 * @apiName get apk
 * @apiGroup Unrestricted
 * @apiVersion  1.0.0
*
* @apiSuccessExample {application/vnd.android.package-archive}
*/
router.get('/download/apk', ctrl.validate('handleGetApk'), ctrl.handleGetApk);

router.get('/notification-images/:filename', ctrl.handleGetNotificationImages);

module.exports = router;
