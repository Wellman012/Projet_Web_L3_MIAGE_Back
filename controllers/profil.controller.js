const profilRepository = require("../repositories/profil.repository");

async function getProfil(req, res) {
    try {
        const pseudo = req.params.pseudo;

        const playlists = await profilRepository.findPlaylistsByCreateur(pseudo);
        const contributions = await profilRepository.findContributionsByPseudo(pseudo);
        const genreRow = await profilRepository.findGenreFavoriByPseudo(pseudo);

        res.json({
            pseudo,
            playlists,
            contributions,
            genreFavori: genreRow[0]?.genre || "Aucun"
        });
    } catch (error) {
        console.error("Erreur dans getProfil :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

module.exports = {
    getProfil
};
