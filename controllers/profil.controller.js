const profilRepository = require("../repositories/profil.repository");

// Récupère les informations principales à afficher sur la page profil d'un utilisateur
// La réponse regroupe ses playlists créées, ses contributions et son genre favori
async function getProfil(req, res) {
    try {
        // Le pseudo reçu dans l'URL sert de base à toutes les recherches liées au profil
        const pseudo = req.params.pseudo;

        // Ces requêtes récupèrent les différentes informations pour l'affichage du profil
        const playlists = await profilRepository.findPlaylistsByCreateur(pseudo);
        const contributions = await profilRepository.findContributionsByPseudo(pseudo);
        const genreRow = await profilRepository.findGenreFavoriByPseudo(pseudo);

        // Si aucun genre favori n'est trouvé, une valeur par défaut est renvoyée
        res.json({
            pseudo,
            playlists,
            contributions,
            genreFavori: genreRow[0]?.genre || "Aucun"
        });
    } catch (error) {
        // Le détail de l'erreur est conservé côté serveur pour faciliter le diagnostic en cas de problème
        console.error("Erreur dans getProfil :", error);

        // Le client reçoit une erreur 500 en cas de problème 
        res.status(500).json({ message: "Erreur serveur" });
    }
}

module.exports = {
    getProfil
};