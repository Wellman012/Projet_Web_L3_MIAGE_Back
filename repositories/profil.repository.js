const db = require('../db');

async function findPlaylistsByCreateur(pseudo) {
    const [rows] = await db.query(
        `SELECT P.id, P.nom AS titre, P.pseudo_createur AS createur, G.genre, G.color, P.nb_clics
         FROM playlist P
         JOIN genre G ON P.genre = G.id
         WHERE P.pseudo_createur = ?
         ORDER BY P.id`,
        [pseudo]
    );
    return rows;
}

async function findContributionsByPseudo(pseudo) {
    const [rows] = await db.query(
        `SELECT p.id, p.nom AS titre, p.pseudo_createur AS createur, G.genre, G.color, p.nb_clics
         FROM playlist p
         JOIN playlist_contributeur pc ON p.id = pc.playlist_id
         JOIN user u ON pc.user_id = u.id
         JOIN genre G ON p.genre = G.id
         WHERE u.pseudo = ? AND pc.role_contribution != 'createur'`,
        [pseudo]
    );
    return rows;
}

async function findGenreFavoriByPseudo(pseudo) {
    const [rows] = await db.query(
        `SELECT G.genre, COUNT(*) as total
         FROM playlist P
         JOIN genre G ON P.genre = G.id
         WHERE P.pseudo_createur = ?
         GROUP BY G.genre
         ORDER BY total DESC
         LIMIT 1`,
        [pseudo]
    );
    return rows;
}

module.exports = {
    findPlaylistsByCreateur,
    findContributionsByPseudo,
    findGenreFavoriByPseudo
};