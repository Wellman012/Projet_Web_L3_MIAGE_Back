const morceauxRepository = require("../repositories/morceaux.repository");

const PORT = 3000;

async function getAllMorceaux(req, res) {
    try {
        const rows = await morceauxRepository.findAllMorceaux();
        res.json(rows);
    } catch (error) {
        console.error("Erreur dans getAllMorceaux :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function searchMorceaux(req, res) {
    try {
        const name = req.query.name;
        const rows = await morceauxRepository.searchMorceaux(name);

        // Permet de filtrer les morceaux depuis le front à partir du nom ou des artistes
        res.json(rows);
    } catch (error) {
        console.error("Erreur dans searchMorceaux :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function getMorceauById(req, res) {
    try {
        const id = req.params.id;
        const rows = await morceauxRepository.findMorceauById(id);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Morceau introuvable" });
        }

        const morceau = rows[0];

        // Construit l'URL publique du fichier audio pour lancer l'audio
        res.json({
            ...morceau,
            url: `http://localhost:${PORT}/morceaux-fichiers/${morceau.chemin}`
        });
    } catch (error) {
        console.error("Erreur dans getMorceauById :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function createMorceau(req, res) {
    try {
        const { titre, artiste } = req.body;
        if (!req.file) {
            return res.status(400).json({ message: "Fichier audio manquant" });
        }

        const chemin = req.file.filename;

        const result = await morceauxRepository.createMorceau(titre, artiste, chemin);

        // Renvoie les données du morceau créé pour MAJ la liste de morceaux 
        res.status(201).json({
            id: result.insertId,
            titre,
            artiste,
            chemin
        });
    } catch (error) {
        console.error("Erreur dans createMorceau :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

module.exports = {
    getAllMorceaux,
    searchMorceaux,
    getMorceauById,
    createMorceau
};