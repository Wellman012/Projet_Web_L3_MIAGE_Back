const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = "./Morceaux";

// Vérifie l'existence du dossier qui stocke les fichiers audio importés
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Définit les règles de stockage des fichiers envoyés avec Multer
const storage = multer.diskStorage({
    // Enregistre les fichiers dans le dossier des morceaux
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },

    // Génère un nom unique à partir du champ envoyé, de la date et de l'extension du fichier
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

// Configure Multer pour le stockage sur disque et le filtrage des fichiers
const upload = multer({
    storage: storage,

    // Vérifie que le fichier envoyé correspond bien à un format audio
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

        // Le fichier est accepté uniquement si l'extension et le type MIME correspondent
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error("Seuls les fichiers audio sont autorisés"));
        }
    }
});

module.exports = upload;