const db = require("../db");

async function findAllMorceaux() {
    // Récupère la liste des morceaux

    const [rows] = await db.query(
        "SELECT id, titre, artiste FROM morceau ORDER BY titre"
    );
    return rows;
}

async function searchMorceaux(name) {
    const [rows] = await db.query(
        // La recherche porte à la fois sur le titre et l'artiste
        "SELECT id, titre, artiste FROM morceau WHERE titre LIKE ? OR artiste LIKE ? ORDER BY titre",
        [`%${name}%`, `%${name}%`]
    );
    return rows;
}

async function findMorceauById(id) {
    const [rows] = await db.query(
        "SELECT id, titre, artiste, chemin FROM morceau WHERE id = ?",
        [id]
    );
    // On renvoie le chemin pour contruire le lien direct et lançable par le front
    return rows;
}

async function createMorceau(titre, artiste, chemin) {
    const [result] = await db.query(
        "INSERT INTO morceau (titre, artiste, chemin) VALUES (?, ?, ?)",
        [titre, artiste, chemin]
    );
    return result;
}

module.exports = {
    findAllMorceaux,
    searchMorceaux,
    findMorceauById,
    createMorceau
};