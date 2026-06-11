const express = require('express');
const router = express.Router();

const upload = require('../config/multer.config');
const morceauxController = require('../controllers/morceaux.controller');

router.get('/morceaux', morceauxController.getAllMorceaux);
router.get('/morceaux/recherche', morceauxController.searchMorceaux);
router.get('/morceaux/:id', morceauxController.getMorceauById);

router.post('/morceaux', upload.single('fichier'), morceauxController.createMorceau);

module.exports = router;
