const express = require("express");
const router = express.Router();

const profilController = require("../controllers/profil.controller");
//Renvoie les infos nécessaires pour afficher le profil
router.get("/profil/:pseudo", profilController.getProfil);

module.exports = router;
