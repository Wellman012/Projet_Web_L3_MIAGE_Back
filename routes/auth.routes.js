const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');

router.get('/verifier-pseudo/:pseudo', authController.verifierPseudo);
router.post('/inscription', authController.inscription);
router.post('/connexion', authController.connexion);

module.exports = router;