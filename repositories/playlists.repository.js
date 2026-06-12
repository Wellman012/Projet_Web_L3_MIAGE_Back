const db = require("../db");

async function findAllPlaylists(sort = "id", order = "asc") {
    const allowedSorts = {
        id: "P.id",
        clicks: "nb_clics",
        nom: "nom",
        genre: "G.genre"
    };

    const allowedOrders = {
        asc: "ASC",
        desc: "DESC"
    };

    // Limite les colonnes et ordres autorisés pour éviter une injection SQL via le tri 
    const sortColumn = allowedSorts[sort] || allowedSorts.id;
    const sortOrder = allowedOrders[order?.toLowerCase()] || allowedOrders.asc;

    const [rows] = await db.query(
        `SELECT P.id, nom AS titre, pseudo_createur AS createur, G.genre, G.color, nb_clics
         FROM playlist P
         JOIN genre G ON P.genre = G.id
         ORDER BY ${sortColumn} ${sortOrder}`
    );

    return rows;
}

async function cherchePlaylistsByName(name) {
    const [rows] = await db.query(
        `SELECT P.id, nom AS titre, pseudo_createur AS createur, G.genre, G.color, nb_clics
         FROM playlist P
         JOIN genre G ON P.genre = G.id
         WHERE nom LIKE ?
         ORDER BY id`,
        [`%${name}%`]
    );

    // Recherche les playlists par nom et renvoie leurs informations 
    return rows;
}

async function findPlaylistById(id) {
    const [rows] = await db.query(
        `SELECT P.id, nom AS titre, pseudo_createur AS createur, G.genre, G.color, nb_clics
         FROM playlist P
         JOIN genre G ON P.genre = G.id
         WHERE P.id = ?`,
        [id]
    );
    return rows;
}

async function findContributeursByPlaylistId(id) {
    //Permet d'afficher la liste complète de contributeurs
    const [rows] = await db.query(
        `SELECT u.pseudo
         FROM playlist_contributeur pc
         JOIN user u ON pc.user_id = u.id
         WHERE pc.playlist_id = ? AND pc.role_contribution != "createur"`,
        [id]
    );
    return rows;
}

async function findAllGenres() {
    const [rows] = await db.query("SELECT genre FROM genre");
    return rows;
}

async function findMorceauxByPlaylistId(id) {
    // l'ordre est récupéré depuis la BD
    const [rows] = await db.query(
        `SELECT m.id, m.titre, m.artiste, m.chemin, pm.ordre_dans_playlist
         FROM playlist_morceau pm
         JOIN morceau m ON pm.morceau_id = m.id
         WHERE pm.playlist_id = ?
         ORDER BY pm.ordre_dans_playlist`,
        [id]
    );
    return rows;
}

async function incrementPlaylistClick(id) {
    const [result] = await db.query(
        "UPDATE playlist SET nb_clics = nb_clics + 1 WHERE id = ?",
        [id]
    );
    return result;
}

async function findGenreByName(genre) {
    // Vérifie l'existence du genre avant d'en créer un nouveau
    const [rows] = await db.query(
        "SELECT id FROM genre WHERE genre = ?",
        [genre]
    );
    return rows;
}

async function createGenre(genre, color) {
    const [result] = await db.query(
        "INSERT INTO genre (genre, color) VALUES (?, ?)",
        [genre, color]
    );
    return result;
}

async function createPlaylist(titre, genreId, createur) {
    const [result] = await db.query(
        "INSERT INTO playlist (nom, genre, pseudo_createur, nb_clics) VALUES (?, ?, ?, 0)",
        [titre, genreId, createur]
    );
    return result;
}

async function findUserByPseudo(pseudo) {
    //Utilisé pour la liste d econtributeurs
    const [rows] = await db.query(
        "SELECT id FROM user WHERE pseudo = ?",
        [pseudo]
    );
    return rows;
}

async function addCreateurAsContributeur(playlistId, userId) {
    const [result] = await db.query(
        "INSERT IGNORE INTO playlist_contributeur (playlist_id, user_id, role_contribution) VALUES (?, ?, ?)",
        [playlistId, userId, "createur"]
        // INSERT IGNORE évite les doublons
    );
    return result;
}

async function deleteMorceauFromPlaylist(playlistId, morceauId) {
    // Supprime l'association  playlist/morceau
    const [result] = await db.query(
        "DELETE FROM playlist_morceau WHERE playlist_id = ? AND morceau_id = ?",
        [playlistId, morceauId]
    );
    return result;
}

async function findExistingMorceauxByPlaylistId(playlistId) {
    //Pour éviter les doublons de morceaux
    const [rows] = await db.query(
        "SELECT morceau_id FROM playlist_morceau WHERE playlist_id = ?",
        [playlistId]
    );
    return rows;
}

async function findUserAndCreateurByPlaylistIdAndPseudo(playlistId, pseudo) {
    const [rows] = await db.query(
        `SELECT u.id AS userId, p.pseudo_createur AS createurPseudo
         FROM user u
         JOIN playlist p ON p.id = ?
         WHERE u.pseudo = ?`,
        [playlistId, pseudo]
    );

    // Récupère en une seule requête l'utilisateur courant et le créateur de la playlist
    return rows;
}

async function addContributeurIfNeeded(playlistId, userId) {
    // Ajoute les nouveaux contributeur

    const [result] = await db.query(
        "INSERT IGNORE INTO playlist_contributeur (playlist_id, user_id, role_contribution) VALUES (?, ?, ?)",
        [playlistId, userId, "contributeur"]
    );

    return result;
}

async function findMaxOrdreByPlaylistId(playlistId) {
    const [rows] = await db.query(
        // COALESCE renvoie 0 si la playlist est vide pour initialiser correctement l'ordre.
        `SELECT COALESCE(MAX(ordre_dans_playlist), 0) AS maxOrdre
         FROM playlist_morceau
         WHERE playlist_id = ?`,
        [playlistId]
    );

    return rows;
}

async function insertMorceauxIntoPlaylist(values) {
    const [result] = await db.query(
        `INSERT INTO playlist_morceau (playlist_id, morceau_id, ordre_dans_playlist)
         VALUES ?`,
        [values]
    );
    return result;
}

module.exports = {
    findAllPlaylists,
    cherchePlaylistsByName,
    findPlaylistById,
    findContributeursByPlaylistId,
    findAllGenres,
    findMorceauxByPlaylistId,
    incrementPlaylistClick,
    findGenreByName,
    createGenre,
    createPlaylist,
    findUserByPseudo,
    addCreateurAsContributeur,
    deleteMorceauFromPlaylist,
    findExistingMorceauxByPlaylistId,
    findUserAndCreateurByPlaylistIdAndPseudo,
    addContributeurIfNeeded,
    findMaxOrdreByPlaylistId,
    insertMorceauxIntoPlaylist
};