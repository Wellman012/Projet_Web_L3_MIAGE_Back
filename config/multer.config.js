const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = './Morceaux';

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedExt = /mp3|mp4|wav/;
        const extname = allowedExt.test(path.extname(file.originalname).toLowerCase());

        const allowedMimeTypes = [
            'audio/mpeg',
            'audio/mp4',
            'audio/wav',
            'audio/x-wav'
        ];
        const mimetype = allowedMimeTypes.includes(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers audio sont autorisés'));
        }
    }
});

module.exports = upload;