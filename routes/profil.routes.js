const express = require('express');
const router = express.Router();

const profilController = require('../controllers/profil.controller');

router.get('/profil/:pseudo', profilController.getProfil);

module.exports = router;
