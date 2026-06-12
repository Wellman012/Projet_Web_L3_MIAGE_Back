const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// Renvoie vers la fonction qui gère la création d'un nouveau compte
router.post("/inscription", authController.inscription);

// Renvoie vers la fonction de connexion appelée lors de la tentative d'authentification
router.post("/connexion", authController.connexion);

module.exports = router;