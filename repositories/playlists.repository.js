const db = require("../db");

// Récupère toutes les playlists avec le tri demandé dans la requête
// Les colonnes de tri et les ordres autorisés sont limités avant la construction de la requête
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

    // Sélectionne uniquement une colonne et un ordre autorisés pour le tri
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

// Recherche les playlists dont le nom correspond au texte saisi
// Les informations renvoyées correspondent à celles affichées dans la liste des playlists
async function cherchePlaylistsByName(name) {
    const [rows] = await db.query(
        `SELECT P.id, nom AS titre, pseudo_createur AS createur, G.genre, G.color, nb_clics
         FROM playlist P
         JOIN genre G ON P.genre = G.id
         WHERE nom LIKE ?
         ORDER BY id`,
        [`%${name}%`]
    );

    return rows;
}

// Récupère une playlist précise à partir de son identifiant
// Les informations du genre sont jointes à la requête principale
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

// Récupère les pseudos des contributeurs associés à une playlist
// Le créateur est exclu ici car il est déjà présent dans les informations principales de la playlist
async function findContributeursByPlaylistId(id) {
    const [rows] = await db.query(
        `SELECT u.pseudo
         FROM playlist_contributeur pc
         JOIN user u ON pc.user_id = u.id
         WHERE pc.playlist_id = ? AND pc.role_contribution != "createur"`,
        [id]
    );

    return rows;
}

// Récupère la liste complète des genres enregistrés dans la base pour l'affichage en menu déroulant
async function findAllGenres() {
    const [rows] = await db.query("SELECT genre FROM genre");
    return rows;
}

// Récupère les morceaux liés à une playlist avec leur ordre de lecture
// L'ordre est lu dans la table de liaison car il dépend de la playlist
async function findMorceauxByPlaylistId(id) {
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

// Incrémente le nombre de clics d'une playlist
async function incrementPlaylistClick(id) {
    const [result] = await db.query(
        "UPDATE playlist SET nb_clics = nb_clics + 1 WHERE id = ?",
        [id]
    );
    return result;
}

// Recherche un genre existant à partir de son nom
// Cette fonction est utilisée avant de créer un nouveau genre
async function findGenreByName(genre) {
    const [rows] = await db.query(
        "SELECT id FROM genre WHERE genre = ?",
        [genre]
    );
    return rows;
}

// Crée un nouveau genre avec sa couleur associée
async function createGenre(genre, color) {
    const [result] = await db.query(
        "INSERT INTO genre (genre, color) VALUES (?, ?)",
        [genre, color]
    );

    return result;
}

// Crée une nouvelle playlist avec le titre, le genre et le pseudo du créateur
// Le nombre de clics est initialisé à 0 dès l'insertion
async function createPlaylist(titre, genreId, createur) {
    const [result] = await db.query(
        "INSERT INTO playlist (nom, genre, pseudo_createur, nb_clics) VALUES (?, ?, ?, 0)",
        [titre, genreId, createur]
    );

    return result;
}

// Récupère l'identifiant d'un utilisateur à partir de son pseudo
// Cette fonction est utilisée lors de la gestion des contributeurs
async function findUserByPseudo(pseudo) {
    const [rows] = await db.query(
        "SELECT id FROM user WHERE pseudo = ?",
        [pseudo]
    );

    return rows;
}

// Ajoute le créateur dans la table des contributeurs de la playlist
// INSERT IGNORE évite de créer un doublon si le lien existe déjà
async function addCreateurAsContributeur(playlistId, userId) {
    const [result] = await db.query(
        "INSERT IGNORE INTO playlist_contributeur (playlist_id, user_id, role_contribution) VALUES (?, ?, ?)",
        [playlistId, userId, "createur"]
    );

    return result;
}

// Supprime le lien entre une playlist et un morceau
// Le morceau reste présent dans la BD
async function deleteMorceauFromPlaylist(playlistId, morceauId) {
    const [result] = await db.query(
        "DELETE FROM playlist_morceau WHERE playlist_id = ? AND morceau_id = ?",
        [playlistId, morceauId]
    );

    return result;
}

// Récupère les identifiants des morceaux déjà présents dans une playlist
// Cette liste est utilisée avant l'ajout pour éviter les doublons
async function findExistingMorceauxByPlaylistId(playlistId) {
    const [rows] = await db.query(
        "SELECT morceau_id FROM playlist_morceau WHERE playlist_id = ?",
        [playlistId]
    );

    return rows;
}

// Récupère l'utilisateur courant et le créateur de la playlist
// Le résultat permet de savoir si l'utilisateur doit être ajouté comme contributeur
async function findUserAndCreateurByPlaylistIdAndPseudo(playlistId, pseudo) {
    const [rows] = await db.query(
        `SELECT u.id AS userId, p.pseudo_createur AS createurPseudo
         FROM user u
         JOIN playlist p ON p.id = ?
         WHERE u.pseudo = ?`,
        [playlistId, pseudo]
    );

    return rows;
}

// Ajoute un contributeur à la playlist si le lien n'existe pas déjà
// INSERT IGNORE évite les doublons dans la table de liaison
async function addContributeurIfNeeded(playlistId, userId) {
    const [result] = await db.query(
        "INSERT IGNORE INTO playlist_contributeur (playlist_id, user_id, role_contribution) VALUES (?, ?, ?)",
        [playlistId, userId, "contributeur"]
    );

    return result;
}

// Récupère la position maximale actuellement utilisée dans une playlist
// COALESCE renvoie 0 quand la playlist ne contient encore aucun morceau
async function findMaxOrdreByPlaylistId(playlistId) {
    const [rows] = await db.query(
        `SELECT COALESCE(MAX(ordre_dans_playlist), 0) AS maxOrdre
         FROM playlist_morceau
         WHERE playlist_id = ?`,
        [playlistId]
    );

    return rows;
}

// Insère plusieurs morceaux dans une playlist en une seule requête
// Les valeurs reçues contiennent l'id de la playlist, l'id du morceau et son ordre
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
