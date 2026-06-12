const db = require("../db");

// Récupère la liste de tous les morceaux enregistrés dans la base
// Les données renvoyées ici alimentent la liste principale côté front
async function findAllMorceaux() {
    const [rows] = await db.query(
        "SELECT id, titre, artiste FROM morceau ORDER BY titre"
    );
    return rows;
}

// Recherche des morceaux à partir du texte saisi par l'utilisateur
// La recherche porte à la fois sur le titre du morceau et sur le nom de l'artiste
async function searchMorceaux(name) {
    const [rows] = await db.query(
        "SELECT id, titre, artiste FROM morceau WHERE titre LIKE ? OR artiste LIKE ? ORDER BY titre",
        [`%${name}%`, `%${name}%`]
    );
    return rows;
}

// Récupère un morceau précis à partir de son identifiant
// Le chemin du fichier est aussi renvoyé car il servira ensuite à construire l'URL de lecture côté front
async function findMorceauById(id) {
    const [rows] = await db.query(
        "SELECT id, titre, artiste, chemin FROM morceau WHERE id = ?",
        [id]
    );
    return rows;
}

// Insère un nouveau morceau dans la base avec son titre, son artiste et le nom du fichier stocké
// Le résultat SQL renvoyé permet ensuite de récupérer l'identifiant généré automatiquement
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