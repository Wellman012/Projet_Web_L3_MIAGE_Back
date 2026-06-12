const morceauxRepository = require("../repositories/morceaux.repository");

const PORT = 3000;

// Récupère tous les morceaux enregistrés dans la base
// Cette fonction permet d'alimenter la liste principale affichée côté front
async function getAllMorceaux(req, res) {
    try {
        const rows = await morceauxRepository.findAllMorceaux();
        res.json(rows);
    } catch (error) {
        // L'erreur est affichée côté serveur pour faciliter le debug
        console.error("Erreur dans getAllMorceaux :", error);

        // Le client reçoit une erreur 500 en cas de problème 
        res.status(500).json({ message: "Erreur serveur" });
    }
}

// Recherche les morceaux à partir d'un texte saisi dans le champ de recherche
// La recherche peut porter sur le titre du morceau ou sur le nom de l'artiste
async function searchMorceaux(req, res) {
    try {
        const name = req.query.name;
        const rows = await morceauxRepository.searchMorceaux(name);

        res.json(rows);
    } catch (error) {
        // L'erreur est affichée côté serveur pour faciliter le debug
        console.error("Erreur dans searchMorceaux :", error);

        // Le client reçoit une erreur 500 en cas de problème 
        res.status(500).json({ message: "Erreur serveur" });
    }
}

// Récupère un morceau précis à partir de son identifiant
// La réponse contient aussi l'URL du fichier audio pour permettre sa lecture côté front
async function getMorceauById(req, res) {
    try {
        const id = req.params.id;
        const rows = await morceauxRepository.findMorceauById(id);

        // Si aucun morceau ne correspond à l'identifiant reçu, le back renvoie une erreur 404
        if (rows.length === 0) {
            return res.status(404).json({ message: "Morceau introuvable" });
        }

        const morceau = rows[0];

        // L'URL est reconstruite ici à partir du nom du fichier pour permettre au front de lancer l'audio
        res.json({
            ...morceau,
            url: `http://localhost:${PORT}/morceaux-fichiers/${morceau.chemin}`
        });
    } catch (error) {
        // L'erreur est affichée côté serveur pour faciliter le debug
        console.error("Erreur dans getMorceauById :", error);

        // Le client reçoit une erreur 500 en cas de problème 
        res.status(500).json({ message: "Erreur serveur" });
    }
}

// Crée un nouveau morceau à partir des informations du formulaire et du fichier audio envoyé
// Après insertion, le back renvoie les données utiles pour mettre à jour l'affichage côté front
async function createMorceau(req, res) {
    try {
        const { titre, artiste } = req.body;

        // La création du morceau n'est pas autorisée si aucun fichier audio n'a été transmis
        if (!req.file) {
            return res.status(400).json({ message: "Fichier audio manquant" });
        }

        const chemin = req.file.filename;

        const result = await morceauxRepository.createMorceau(titre, artiste, chemin);

        res.status(201).json({
            id: result.insertId,
            titre,
            artiste,
            chemin
        });
    } catch (error) {
        // L'erreur est affichée côté serveur pour faciliter le debug
        console.error("Erreur dans createMorceau :", error);

        // Le client reçoit une erreur 500 en cas de problème 
        res.status(500).json({ message: "Erreur serveur" });
    }
}

module.exports = {
    getAllMorceaux,
    searchMorceaux,
    getMorceauById,
    createMorceau
};
