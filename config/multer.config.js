const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = "./Morceaux";

// Garantit l'existence du dossier de stockage avant tout upload
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    // Stocke  les fichiers audio dans le dossier dédié
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },

    // Génère un nom unique pour limiter les doublons
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,

    // Filtre les fichiers autorisés 
    fileFilter: (req, file, cb) => {
        const allowedExt = /mp3|mp4|wav/;
        const extname = allowedExt.test(path.extname(file.originalname).toLowerCase());

        const allowedMimeTypes = [
            "audio/mpeg",
            "audio/mp4",
            "audio/wav",
            "audio/x-wav"
        ];
        const mimetype = allowedMimeTypes.includes(file.mimetype);

        // Vérification pour éviter les faux fichiers audio
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error("Seuls les fichiers audio sont autorisés"));
        }
    }
});

module.exports = upload;
