const db = require("../db");

// Insère un nouvel utilisateur dans la base avec les données reçues depuis le formulaire
// La requête renvoie ensuite un résultat SQL contenant notamment l'id créé
async function createUser(nom, prenom, pseudo, motDePasse) {
    const [result] = await db.query(
        "INSERT INTO user (nom, prenom, pseudo, mdp) VALUES (?, ?, ?, ?)",
        [nom, prenom, pseudo, motDePasse]
    );

    // Le résultat brut est utile pour récupérer l'id généré dans le SQL
    return result;
}

// Recherche un utilisateur correspondant au pseudo et au mot de passe envoyés
// Cette vérification permet de valider la connexion côté back
async function findUserForLogin(pseudo, motDePasse) {
    const [rows] = await db.query(
        "SELECT pseudo FROM user WHERE pseudo = ? AND mdp = ?",
        [pseudo, motDePasse]
    );

    // Si une ligne est trouvée, les identifiants sont considérés comme valides
    return rows;
}

module.exports = {
    createUser,
    findUserForLogin
};