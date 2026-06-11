const express = require('express');
const router = express.Router();

const playlistsController = require('../controllers/playlists.controller');

router.get('/playlists', playlistsController.getAllPlaylists);
router.post('/playlists', playlistsController.createPlaylist);

router.get('/playlists/recherche', playlistsController.searchPlaylists);

router.get('/playlists/genres', playlistsController.getAllGenres);

router.get('/playlists/:id/morceaux', playlistsController.getMorceauxByPlaylistId);
router.post('/playlists/:id/click', playlistsController.incrementClick);
router.delete('/playlists/:playlistId/morceaux/:morceauId', playlistsController.deleteMorceau);
router.post('/playlists/:playlistId/morceaux', playlistsController.addMorceauxToPlaylist);
router.get('/playlists/:id', playlistsController.getPlaylistById);

module.exports = router;