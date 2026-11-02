const { uploadImage } = require('../s3');
const { logFmt, apiFmt } = require('../services/fmt');

async function uploadFile(req, res, next) {
    try {
        const { type } = req.body;
        const userId = req.user.id;
        const file = req.file;
        if (type === 'PROFILE_PICTURE') {
            file.s3Key = `${userId}/profile/${file.filename}`;
        }
        else {
            file.s3Key = `${userId}/files/${file.filename}`;
        }
        const key = await uploadImage(file);
        const response = { key };
        res.json(apiFmt(response, "Image uploaded successfully"));
    } catch (e) {
        console.log(e);
        next(e);
    }
}


module.exports = { uploadFile };
