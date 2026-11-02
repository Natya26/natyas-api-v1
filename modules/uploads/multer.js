const multer = require('multer');
const fs = require('fs');
const tempPath = './tmp';

if (!fs.existsSync(tempPath)) {
    fs.mkdirSync(tempPath);
}

const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, tempPath);
    },
    filename(req, file, callback) {
        callback(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage, dest: './uploads' });
module.exports = upload;