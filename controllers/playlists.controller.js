const playlistsRepository = require("../repositories/playlists.repository");


//Cherhce toutes les playlists pour afficher la liste
async function getAllPlaylists(req, res) {
    try {
        const sort = req.query.sort || "id";
        const order = req.query.order || "asc";

        const rows = await playlistsRepository.findAllPlaylists(sort, order);
        res.json(rows);
    } catch (error) {
        console.error("Erreur dans getAllPlaylists :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function cherchePlaylists(req, res) {
    try {
        const name = req.query.name;
        const rows = await playlistsRepository.cherchePlaylistsByName(name);

        // Permet de filtrer les playlists à partir du titre cherché
        res.json(rows);
    } catch (error) {
        console.error("Erreur dans cherchePlaylists :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function getPlaylistById(req, res) {
    try {
        const id = req.params.id;

        const playlist = await playlistsRepository.findPlaylistById(id);

        if (playlist.length === 0) {
            return res.status(404).json({ message: "Playlist introuvable" });
        }

        const contributeurs = await playlistsRepository.findContributeursByPlaylistId(id);

        // Agrège les infos la playlist et la liste des contributeurs pour simplifier la réponse
        res.json({
            ...playlist[0],
            contributeurs: contributeurs.map(c => c.pseudo)
        });
    } catch (error) {
        console.error("Erreur dans getPlaylistById :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function getAllGenres(req, res) {
    try {
        const rows = await playlistsRepository.findAllGenres();

        //Renvoie les genres pour le menu déroulant
        res.json(rows.map(r => r.genre));
    } catch (error) {
        console.error("Erreur dans getAllGenres :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function getMorceauxByPlaylistId(req, res) {
    try {
        const id = req.params.id;
        const rows = await playlistsRepository.findMorceauxByPlaylistId(id);

        const morceauxWithUrl = rows.map(m => ({
            ...m,

            // Construit l'URL de lecture pour lancer les morceaux
            url: m.chemin && m.chemin !== ""
                ? `http://localhost:3000/morceaux-fichiers/${m.chemin}`
                : null
        }));

        res.json(morceauxWithUrl);
    } catch (error) {
        console.error("Erreur dans getMorceauxByPlaylistId :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function incrementClick(req, res) {
    try {
        const id = req.params.id;
        await playlistsRepository.incrementPlaylistClick(id);

        // MAJ le compteur de clics de la playlist
        res.status(200).json({ message: "Clic enregistré" });
    } catch (error) {
        console.error("Erreur dans incrementClick :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function createPlaylist(req, res) {
    try {
        const { titre, genre, createur, color } = req.body;

        let genreId;

        const genreRow = await playlistsRepository.findGenreByName(genre);

        // Crée le genre s'il n'existe pas encore, sinon réutilise l'id du genre
        if (genreRow.length === 0) {
            const newGenre = await playlistsRepository.createGenre(genre, color);
            genreId = newGenre.insertId;
        } else {
            genreId = genreRow[0].id;
        }

        const result = await playlistsRepository.createPlaylist(titre, genreId, createur);
        const playlistId = result.insertId;

        const userRows = await playlistsRepository.findUserByPseudo(createur);

        // Le créateur est ajouté comme contributeur automatiquement car pas de logique à créer une playlists pour la laisser vide
        if (userRows.length > 0) {
            await playlistsRepository.addCreateurAsContributeur(playlistId, userRows[0].id);
        }

        res.status(201).json({
            id: playlistId,
            titre,
            genre,
            createur
        });
    } catch (error) {
        console.error("Erreur dans createPlaylist :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function deleteMorceau(req, res) {
    try {
        const { playlistId, morceauId } = req.params;

        // Supprime le lien playlist-morceau
        await playlistsRepository.deleteMorceauFromPlaylist(playlistId, morceauId);

        res.status(200).json({ message: "Morceau retiré" });
    } catch (error) {
        console.error("Erreur dans deleteMorceau :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
}

async function addMorceauxToPlaylist(req, res) {
    const playlistId = parseInt(req.params.playlistId, 10);
    const morceaux = req.body.morceaux;
    const pseudo = req.body.pseudo;

    if (!Array.isArray(morceaux) || morceaux.length === 0) {
        return res.status(400).json({ error: "La liste des morceaux est invalide ou vide" });
    }

    try {
        // Enlève les doublons dans la selection
        const uniqueMorceaux = [...new Set(morceaux)]; // Set retire automatique les doublons

        const existingRows = await playlistsRepository.findExistingMorceauxByPlaylistId(playlistId);
        const existingIds = new Set(existingRows.map((row) => row.morceau_id));

        const morceauxAInserer = uniqueMorceaux.filter((morceauId) => !existingIds.has(morceauId));
        const morceauxDejaPresents = uniqueMorceaux.filter((morceauId) => existingIds.has(morceauId));

        if (pseudo) {
            const userRows = await playlistsRepository.findUserAndCreateurByPlaylistIdAndPseudo(playlistId, pseudo);

            if (userRows.length > 0) {
                const userId = userRows[0].userId;
                const createurPseudo = userRows[0].createurPseudo;

                // Un utilisateur non contributeur le devient lorsqu"il ajoute un morceau
                if (pseudo !== createurPseudo) {
                    await playlistsRepository.addContributeurIfNeeded(playlistId, userId);
                }
            }
        }

        if (morceauxAInserer.length === 0) {
            return res.status(200).json({
                message: "Aucun nouveau morceau à ajouter",
                playlistId,
                morceauxAjoutes: 0,
                dejaPresents: morceauxDejaPresents
            });
        }

        const rows = await playlistsRepository.findMaxOrdreByPlaylistId(playlistId);
        let ordre = rows[0].maxOrdre || 0;

        // Calcule l'ordre des morceaux pour garder la liste d'attente prévue
        const values = morceauxAInserer.map((morceauId) => {
            ordre++;
            return [playlistId, morceauId, ordre];
        });

        await playlistsRepository.insertMorceauxIntoPlaylist(values);

        return res.status(201).json({
            message: "Morceaux ajoutés avec succès",
            playlistId,
            morceauxAjoutes: morceauxAInserer.length,
            dejaPresents: morceauxDejaPresents
        });
    } catch (error) {
        console.error("Erreur dans addMorceauxToPlaylist :", error);
        return res.status(500).json({
            error: "Erreur serveur lors de l'ajout des morceaux à la playlist"
        });
    }
}

module.exports = {
    getAllPlaylists,
    cherchePlaylists,
    getPlaylistById,
    getAllGenres,
    getMorceauxByPlaylistId,
    incrementClick,
    createPlaylist,
    deleteMorceau,
    addMorceauxToPlaylist,
};
