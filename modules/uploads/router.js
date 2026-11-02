const { Router } = require('express');
const router = Router();
const ctrl = require('./ctrl');
const multer = require('./multer');
const { ROLES, roleAuthMiddleware } = require('./../authentication/middleware');
const { ADMIN, SUBSCRIBER } = ROLES;

/**
 *
 * @api {POST} /uploads/image Upload Image
 * @apiName UploadImage
 * @apiGroup Uploads
 * @apiVersion  1.0.0
 *
 * @apiParam  {File} file Id of the Service Provider.
 * @apiParam  {type} Type of the file for upload [PROFILE_PICTURE]
 *
 * @apiParamExample  {multipart/form-data;} Request-Example:
    {
        "file": <file>,
        "type": "PROFILE_PICTURE"
    }
 *
 *
 * @apiSuccessExample {json} Success-Response:
    {
        "err": false,
        "msg": "Image uploaded successfully",
        "data": {
            "url": "https://logibids-dev.s3.amazonaws.com/652d84d8-f22b-4aa5-be1d-659e5794c071/profile/1585849864003-gym-studio.jpg"
        }
    }
 *
 *
 */
router.post('/uploads/image', roleAuthMiddleware([ADMIN, SUBSCRIBER]), multer.single('file'), ctrl.uploadFile);

module.exports = router;