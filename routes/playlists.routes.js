const express = require("express");
const router = express.Router();

const playlistsController = require("../controllers/playlists.controller");

// Récupère la liste complète des playlists avec les options de tri
router.get("/playlists", playlistsController.getAllPlaylists);

// Crée une nouvelle playlist à partir des données du front
router.post("/playlists", playlistsController.createPlaylist);

// Lance une recherche de playlists à partir du texte saisi
router.get("/playlists/recherche", playlistsController.cherchePlaylists);

// Renvoie la liste des genres disponibles pour alimenter les choix côté front
router.get("/playlists/genres", playlistsController.getAllGenres);

// Récupère les morceaux associés à une playlist
router.get("/playlists/:id/morceaux", playlistsController.getMorceauxByPlaylistId);

// Incrémente le nombre de clics lorsqu'une playlist est consultée
router.post("/playlists/:id/click", playlistsController.incrementClick);

// Retire uniquement l'association entre la playlist et le morceau ciblé
router.delete("/playlists/:playlistId/morceaux/:morceauId", playlistsController.deleteMorceau);

// Ajoute un ou plusieurs morceaux à une playlist existante
router.post("/playlists/:playlistId/morceaux", playlistsController.addMorceauxToPlaylist);

// Récupère les informations détaillées d'une playlist à partir de son identifiant
router.get("/playlists/:id", playlistsController.getPlaylistById);

module.exports = router;
