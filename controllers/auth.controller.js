const authRepository = require("../repositories/auth.repository");


// Crée un nouvel utilisateur à partir des données envoyées par le formulaire
// Après insertion, la réponse renvoie les informations principales du compte créé pour la connexion automatique
async function inscription(req, res) {
    try {
        const { nom, prenom, pseudo, motDePasse } = req.body;

        const result = await authRepository.createUser(nom, prenom, pseudo, motDePasse);

        res.status(201).json({
            id: result.insertId,
            nom,
            prenom,
            pseudo
        });
    } catch (error) {
        // L'erreur reste journalisée côté back pour faciliter le debug
        console.error("Erreur dans inscription :", error);

        // Si le pseudo existe déjà, il s'agit d'un conflit de données et non d'un bug
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "Pseudo déjà utilisé" });
        }

        // Les autres cas sont traités ici comme des erreurs serveur non prévues
        res.status(500).json({ message: "Erreur serveur" });
    }
}

// Vérifie les identifiants envoyés par le formulaire de connexion
// Si un utilisateur correspondant est trouvé, le back renvoie le pseudo au front
async function connexion(req, res) {
    try {
        const { pseudo, motDePasse } = req.body;
        const rows = await authRepository.findUserForLogin(pseudo, motDePasse);

        // Une ligne trouvée signifie que les identifiants correspondent à un utilisateur existant
        if (rows.length > 0) {
            res.json({ pseudo: rows[0].pseudo });
        } else {
            // Si aucun résultat n'est trouvé, la connexion est refusée
            res.status(401).json({ message: "Identifiants incorrects" });
        }
    } catch (error) {
        // Les erreurs techniques sont conservées côté serveur pour faciliter le debug
        console.error("Erreur dans connexion :", error);

        // Le client reçoit une erreur générique
        res.status(500).json({ message: "Erreur serveur" });
    }
}

module.exports = {
    inscription,
    connexion
};
