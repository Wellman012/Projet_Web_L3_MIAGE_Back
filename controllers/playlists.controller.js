const playlistsRepository = require("../repositories/playlists.repository");

// Cherche toutes les playlists pour afficher la liste
// Le tri et l'ordre peuvent être reçus depuis la requête
async function getAllPlaylists(req, res) {
    try {
        const sort = req.query.sort || "id";
        const order = req.query.order || "asc";

        const rows = await playlistsRepository.findAllPlaylists(sort, order);

        // Renvoie la liste complète des playlists récupérées en base
        res.json(rows);
    } catch (error) {
        console.error("Erreur dans getAllPlaylists :", error);

        // Renvoie une erreur 500 si la récupération des playlists échoue
        res.status(500).json({ message: "Erreur serveur" });
    }
}

// Recherche les playlists à partir du titre saisi dans le champ de recherche
async function cherchePlaylists(req, res) {
    try {
        const name = req.query.name;
        const rows = await playlistsRepository.cherchePlaylistsByName(name);

        // Renvoie les playlists correspondant au texte recherché
        res.json(rows);
    } catch (error) {
        console.error("Erreur dans cherchePlaylists :", error);

        // Renvoie une erreur 500 si la recherche échoue
        res.status(500).json({ message: "Erreur serveur" });
    }
}

// Récupère une playlist précise à partir de son identifiant
// La réponse contient aussi la liste des contributeurs associés à cette playlist
async function getPlaylistById(req, res) {
    try {
        const id = req.params.id;

        const playlist = await playlistsRepository.findPlaylistById(id);

        // Renvoie une erreur 404 si aucune playlist ne correspond à l'identifiant reçu
        if (playlist.length === 0) {
            return res.status(404).json({ message: "Playlist introuvable" });
        }

        const contributeurs = await playlistsRepository.findContributeursByPlaylistId(id);

        // Renvoie les informations de la playlist avec la liste des pseudos contributeurs
        res.json({
            ...playlist[0],
            contributeurs: contributeurs.map(c => c.pseudo)
        });
    } catch (error) {
        console.error("Erreur dans getPlaylistById :", error);

        // Renvoie une erreur 500 si la récupération de la playlist échoue
        res.status(500).json({ message: "Erreur serveur" });
    }
}

// Récupère tous les genres présents en base
// La réponse renvoie uniquement le nom de chaque genre
async function getAllGenres(req, res) {
    try {
        const rows = await playlistsRepository.findAllGenres();

        // Renvoie la liste des genres sous forme de tableau simple
        res.json(rows.map(r => r.genre));
    } catch (error) {
        console.error("Erreur dans getAllGenres :", error);

        // Renvoie une erreur 500 si la récupération des genres échoue
        res.status(500).json({ message: "Erreur serveur" });
    }
}

// Récupère tous les morceaux d'une playlist à partir de son identifiant
// Chaque morceau contient aussi une URL de lecture si un fichier lui est associé
async function getMorceauxByPlaylistId(req, res) {
    try {
        const id = req.params.id;
        const rows = await playlistsRepository.findMorceauxByPlaylistId(id);

        // Construit l'URL de lecture à partir du chemin du fichier quand un morceau possède un fichier audio
        const morceauxWithUrl = rows.map(m => ({
            ...m,
            url: m.chemin && m.chemin !== ""
                ? `http://localhost:3000/morceaux-fichiers/${m.chemin}`
                : null
        }));

        // Renvoie la liste des morceaux avec leur URL de lecture quand elle existe
        res.json(morceauxWithUrl);
    } catch (error) {
        console.error("Erreur dans getMorceauxByPlaylistId :", error);

        // Renvoie une erreur 500 si la récupération des morceaux échoue
        res.status(500).json({ message: "Erreur serveur" });
    }
}

// Incrémente le compteur de clics d'une playlist
async function incrementClick(req, res) {
    try {
        const id = req.params.id;
        await playlistsRepository.incrementPlaylistClick(id);

        // Confirme que le clic a bien été enregistré
        res.status(200).json({ message: "Clic enregistré" });
    } catch (error) {
        console.error("Erreur dans incrementClick :", error);

        // Renvoie une erreur 500 si la mise à jour du compteur échoue
        res.status(500).json({ message: "Erreur serveur" });
    }
}

// Crée une nouvelle playlist à partir des données envoyées par le formulaire
// Si le genre n'existe pas encore, il est créé avant l'insertion de la playlist
async function createPlaylist(req, res) {
    try {
        const { titre, genre, createur, color } = req.body;

        let genreId;

        const genreRow = await playlistsRepository.findGenreByName(genre);

        // Utilise l'id du genre existant ou crée un nouveau genre si aucun résultat n'est trouvé
        if (genreRow.length === 0) {
            const newGenre = await playlistsRepository.createGenre(genre, color);
            genreId = newGenre.insertId;
        } else {
            genreId = genreRow[0].id;
        }

        const result = await playlistsRepository.createPlaylist(titre, genreId, createur);
        const playlistId = result.insertId;

        const userRows = await playlistsRepository.findUserByPseudo(createur);

        // Ajoute le créateur dans les contributeurs si son utilisateur existe en base
        if (userRows.length > 0) {
            await playlistsRepository.addCreateurAsContributeur(playlistId, userRows[0].id);
        }

        // Renvoie la playlist créée avec les informations principales utiles au front
        res.status(201).json({
            id: playlistId,
            titre,
            genre,
            createur
        });
    } catch (error) {
        console.error("Erreur dans createPlaylist :", error);

        // Renvoie une erreur 500 si la création de la playlist échoue
        res.status(500).json({ message: "Erreur serveur" });
    }
}

// Retire un morceau d'une playlist à partir des deux identifiants reçus dans l'URL
// Cette suppression enlève le lien entre la playlist et le morceau
async function deleteMorceau(req, res) {
    try {
        const { playlistId, morceauId } = req.params;

        await playlistsRepository.deleteMorceauFromPlaylist(playlistId, morceauId);

        // Confirme que le morceau a bien été retiré de la playlist
        res.status(200).json({ message: "Morceau retiré" });
    } catch (error) {
        console.error("Erreur dans deleteMorceau :", error);

        // Renvoie une erreur 500 si la suppression échoue
        res.status(500).json({ message: "Erreur serveur" });
    }
}

// Ajoute plusieurs morceaux dans une playlist à partir de la liste envoyée par le front
// Le traitement évite les doublons, gère les contributeurs et calcule l'ordre des nouveaux morceaux
async function addMorceauxToPlaylist(req, res) {
    const playlistId = parseInt(req.params.playlistId, 10);
    const morceaux = req.body.morceaux;
    const pseudo = req.body.pseudo;

    // Renvoie une erreur 400 si la liste reçue n'est pas un tableau valide ou si elle est vide
    if (!Array.isArray(morceaux) || morceaux.length === 0) {
        return res.status(400).json({ error: "La liste des morceaux est invalide ou vide" });
    }

    try {
        // Enlève les doublons dans la sélection reçue
        const uniqueMorceaux = [...new Set(morceaux)];

        const existingRows = await playlistsRepository.findExistingMorceauxByPlaylistId(playlistId);
        const existingIds = new Set(existingRows.map((row) => row.morceau_id));

        // Sépare les morceaux déjà présents de ceux qui doivent encore être ajoutés
        const morceauxAInserer = uniqueMorceaux.filter((morceauId) => !existingIds.has(morceauId));
        const morceauxDejaPresents = uniqueMorceaux.filter((morceauId) => existingIds.has(morceauId));

        // Si un pseudo est fourni, le back vérifie s'il faut ajouter l'utilisateur comme contributeur
        if (pseudo) {
            const userRows = await playlistsRepository.findUserAndCreateurByPlaylistIdAndPseudo(playlistId, pseudo);

            if (userRows.length > 0) {
                const userId = userRows[0].userId;
                const createurPseudo = userRows[0].createurPseudo;

                // Un utilisateur différent du créateur est ajouté comme contributeur lorsqu'il ajoute un morceau
                if (pseudo !== createurPseudo) {
                    await playlistsRepository.addContributeurIfNeeded(playlistId, userId);
                }
            }
        }

        // Renvoie une réponse 200 si aucun nouveau morceau n'est à ajouter
        // La réponse indique aussi quels morceaux étaient déjà présents
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

        // Calcule l'ordre des nouveaux morceaux avant l'insertion dans la table de liaison
        const values = morceauxAInserer.map((morceauId) => {
            ordre++;
            return [playlistId, morceauId, ordre];
        });

        await playlistsRepository.insertMorceauxIntoPlaylist(values);

        // Renvoie une réponse 201 après l'ajout des nouveaux morceaux
        // La réponse indique combien ont été ajoutés et lesquels étaient déjà présents
        return res.status(201).json({
            message: "Morceaux ajoutés avec succès",
            playlistId,
            morceauxAjoutes: morceauxAInserer.length,
            dejaPresents: morceauxDejaPresents
        });
    } catch (error) {
        console.error("Erreur dans addMorceauxToPlaylist :", error);

        // Renvoie une erreur 500 si l'ajout des morceaux échoue
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