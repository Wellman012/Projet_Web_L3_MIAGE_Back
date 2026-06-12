const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// Renvoie vers la fonction pour vérifier si pseudo unique
router.get("/verifier-pseudo/:pseudo", authController.verifierPseudo);

// Renvoi vers l'inscription
router.post("/inscription", authController.inscription);

//Renvoie vers la fonction de connexion qui est appelée dans tous les cas 
router.post("/connexion", authController.connexion);

module.exports = router;