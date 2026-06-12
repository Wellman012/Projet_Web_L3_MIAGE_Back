const db = require("../db");

async function findUserByPseudo(pseudo) {
    const [rows] = await db.query(
        "SELECT id, pseudo FROM user WHERE pseudo = ?",
        [pseudo]
    );

    // vérifie que le pseudo est unique
    return rows;
}

async function createUser(nom, prenom, pseudo, motDePasse) {
    const [result] = await db.query(
        "INSERT INTO user (nom, prenom, pseudo, mdp) VALUES (?, ?, ?, ?)",
        [nom, prenom, pseudo, motDePasse]
    );
    return result;
}

async function findUserByIDs(pseudo, motDePasse) {
    const [rows] = await db.query(
        "SELECT pseudo FROM user WHERE pseudo = ? AND mdp = ?",
        [pseudo, motDePasse]
    );
    return rows;
}

module.exports = {
    findUserByPseudo,
    createUser,
    findUserByIDs
};