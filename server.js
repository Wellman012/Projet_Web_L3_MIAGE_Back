
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// const playlists = [
//     { id: 1, titre: 'Road Trip', genre: 'Rock', createur: 'Afonso' },
//     { id: 2, titre: 'Jazz Evening', genre: 'Jazz', createur: 'Emma' },
//     { id: 3, titre: 'Night Electro', genre: 'Electro', createur: 'leo' },
// ];



app.get('/api/playlists', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT P.id, nom AS titre, pseudo_createur AS createur, G.genre, G.color, nb_clics FROM playlist P join genre G ON P.genre = G.id ORDER BY id');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
    // res.json(playlists)
});

app.get('/api/playlists/genres', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT genre FROM genre');
        res.json(rows.map(r => r.genre));
    } catch (error) {
        console.error('Erreur lors de la récupération des genres :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.get('/api/playlists/recherche', async (req, res) => {

    try {
        const name = req.query.name;
        const [rows] = await db.query('SELECT P.id, nom AS titre, pseudo_createur AS createur, G.genre, G.color, nb_clics FROM playlist P join genre G ON P.genre = G.id WHERE nom LIKE ? ORDER BY id',
            [`%${name}%`]);
        res.json(rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des playlists :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.get('/api/playlists/clicksUp', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT P.id, nom AS titre, pseudo_createur AS createur, G.genre, G.color, nb_clics FROM playlist P join genre G ON P.genre = G.id ORDER BY nb_clics DESC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
app.get('/api/playlists/clicksDown', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT P.id, nom AS titre, pseudo_createur AS createur, G.genre, G.color, nb_clics FROM playlist P join genre G ON P.genre = G.id ORDER BY nb_clics ASC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.get('/api/playlists/alphaUp', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT P.id, nom AS titre, pseudo_createur AS createur, G.genre, G.color, nb_clics FROM playlist P join genre G ON P.genre = G.id ORDER BY nom DESC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
app.get('/api/playlists/alphaDown', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT P.id, nom AS titre, pseudo_createur AS createur, G.genre, G.color, nb_clics FROM playlist P join genre G ON P.genre = G.id ORDER BY nom ASC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.get('/api/playlists/genreUp', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT P.id, nom AS titre, pseudo_createur AS createur, G.genre, G.color, nb_clics FROM playlist P join genre G ON P.genre = G.id ORDER BY G.genre DESC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
app.get('/api/playlists/genreDown', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT P.id, nom AS titre, pseudo_createur AS createur, G.genre, G.color, nb_clics FROM playlist P join genre G ON P.genre = G.id ORDER BY G.genre ASC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Détails d'une playlist avec ses contributeurs
app.get('/api/playlists/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const [playlist] = await db.query(
            'SELECT P.id, nom AS titre, pseudo_createur AS createur, G.genre, G.color, nb_clics FROM playlist P join genre G ON P.genre = G.id WHERE P.id = ?',
            [id]
        );

        if (playlist.length === 0) return res.status(404).json({ message: 'Playlist introuvable' });

        const [contributeurs] = await db.query(
            `SELECT u.pseudo FROM playlist_contributeur pc
             JOIN user u ON pc.user_id = u.id
             WHERE pc.playlist_id = ? AND pc.role_contribution != 'createur'`,
            [id]
        );

        res.json({
            ...playlist[0],
            contributeurs: contributeurs.map(c => c.pseudo)
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Morceaux d'une playlist
app.get('/api/playlists/:id/morceaux', async (req, res) => {
    try {
        const id = req.params.id;
        const [rows] = await db.query(
            `SELECT m.id, m.titre, m.artiste, pm.ordre_dans_playlist
             FROM playlist_morceau pm
             JOIN morceau m ON pm.morceau_id = m.id
             WHERE pm.playlist_id = ?
             ORDER BY pm.ordre_dans_playlist`,
            [id]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});


app.get('/api/morceaux', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, titre, artiste FROM morceau ORDER BY titre');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.get('/api/morceaux/recherche', async (req, res) => {
    try {
        const name = req.query.name;
        const [rows] = await db.query(
            'SELECT id, titre, artiste FROM morceau WHERE titre LIKE ? OR artiste LIKE ? ORDER BY titre',
            [`%${name}%`, `%${name}%`]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.delete('/api/playlists/:playlistId/morceaux/:morceauId', async (req, res) => {
    try {
        const { playlistId, morceauId } = req.params;
        await db.query(
            'DELETE FROM playlist_morceau WHERE playlist_id = ? AND morceau_id = ?',
            [playlistId, morceauId]
        );
        res.status(200).json({ message: 'Morceau retiré' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.post('/api/playlists', async (req, res) => {
    try {
        const { titre, genre, createur, color } = req.body;
        let genreId;
        const [genreRow] = await db.query('SELECT id FROM genre WHERE genre = ?', [genre]);
        if (genreRow.length === 0) {
            const [newGenre] = await db.query('INSERT INTO genre (genre, color) VALUES (?, ?)', [genre, color]);
            genreId = newGenre.insertId;
        } else {
            genreId = genreRow[0].id;
        }

        const [result] = await db.query(
            'INSERT INTO playlist (nom, genre, pseudo_createur, nb_clics) VALUES (?, ?, ?, 0)',
            [titre, genreId, createur]
        );
        const playlistId = result.insertId;

        const [userRows] = await db.query('SELECT id FROM user WHERE pseudo = ?', [createur]);
        if (userRows.length > 0) {
            await db.query(
                'INSERT IGNORE INTO playlist_contributeur (playlist_id, user_id, role_contribution) VALUES (?, ?, ?)',
                [playlistId, userRows[0].id, 'createur']
            );
        }

        res.status(201).json({ id: playlistId, titre, genre, createur });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.get('/api/profil/:pseudo', async (req, res) => {
    try {
        const pseudo = req.params.pseudo;
        const [playlists] = await db.query(
            'SELECT P.id, P.nom AS titre, P.pseudo_createur AS createur, G.genre, G.color, P.nb_clics FROM playlist P JOIN genre G ON P.genre = G.id WHERE P.pseudo_createur = ? ORDER BY P.id',
            [pseudo]
        );
        const [contributions] = await db.query(
            `SELECT p.id, p.nom AS titre, p.pseudo_createur AS createur, G.genre, G.color, p.nb_clics 
             FROM playlist p
             JOIN playlist_contributeur pc ON p.id = pc.playlist_id
             JOIN user u ON pc.user_id = u.id
             JOIN genre G ON p.genre = G.id
             WHERE u.pseudo = ? AND pc.role_contribution != 'createur'`,
            [pseudo]
        );
        const [genreRow] = await db.query(
            `SELECT G.genre, COUNT(*) as total FROM playlist P
             JOIN genre G ON P.genre = G.id
             WHERE P.pseudo_createur = ?
             GROUP BY G.genre ORDER BY total DESC LIMIT 1`,
            [pseudo]
        );
        res.json({
            pseudo,
            playlists,
            contributions,
            genreFavori: genreRow[0]?.genre || 'Aucun'
        });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.get('/api/verifier-pseudo/:pseudo', async (req, res) => {
    try {
        const pseudo = req.params.pseudo;
        const [rows] = await db.query('SELECT id FROM user WHERE pseudo = ?', [pseudo]);
        res.json({ exists: rows.length > 0 });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.post('/api/inscription', async (req, res) => {
    try {
        const { nom, prenom, pseudo, motDePasse } = req.body;
        const [result] = await db.query(
            'INSERT INTO user (nom, prenom, pseudo, mdp) VALUES (?, ?, ?, ?)',
            [nom, prenom, pseudo, motDePasse]
        );
        res.status(201).json({ id: result.insertId, nom, prenom, pseudo });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.post('/api/connexion', async (req, res) => {
    try {
        const { pseudo, motDePasse } = req.body;
        const [rows] = await db.query(
            'SELECT pseudo FROM user WHERE pseudo = ? AND mdp = ?',
            [pseudo, motDePasse]
        );
        if (rows.length > 0) {
            res.json({ pseudo: rows[0].pseudo });
        } else {
            res.status(401).json({ message: 'Identifiants incorrects' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.post('/api/playlists/:playlistId/morceaux', async (req, res) => {
    const playlistId = parseInt(req.params.playlistId, 10);
    const morceaux = req.body.morceaux;
    const pseudo = req.body.pseudo;

    if (!Array.isArray(morceaux) || morceaux.length === 0) {
        return res.status(400).json({ error: 'La liste des morceaux est invalide ou vide' });
    }

    try {
        console.log(`Ajouter ${morceaux.length} morceaux à la playlist ${playlistId}`);

        const uniqueMorceaux = [...new Set(morceaux)];
        const [existingRows] = await db.query(
            'SELECT morceau_id FROM playlist_morceau WHERE playlist_id = ?',
            [playlistId]
        );
        const existingIds = new Set(existingRows.map((row) => row.morceau_id));
        const morceauxAInserer = uniqueMorceaux.filter((morceauId) => !existingIds.has(morceauId));
        const morceauxDejaPresents = uniqueMorceaux.filter((morceauId) => existingIds.has(morceauId));

        if (pseudo) {
            const [userRows] = await db.query(
                `SELECT u.id AS userId, p.pseudo_createur AS createurPseudo
                 FROM user u
                 JOIN playlist p ON p.id = ?
                 WHERE u.pseudo = ?`,
                [playlistId, pseudo]
            );

            if (userRows.length > 0) {
                const userId = userRows[0].userId;
                const createurPseudo = userRows[0].createurPseudo;

                if (pseudo !== createurPseudo) {
                    await db.query(
                        'INSERT IGNORE INTO playlist_contributeur (playlist_id, user_id, role_contribution) VALUES (?, ?, ?)',
                        [playlistId, userId, 'contributeur']
                    );
                }
            }
        }

        if (morceauxAInserer.length === 0) {
            return res.status(200).json({
                message: 'Aucun nouveau morceau à ajouter',
                playlistId,
                morceauxAjoutes: 0,
                dejaPresents: morceauxDejaPresents
            });
        }

        const getMaxOrdreQuery = `
            SELECT COALESCE(MAX(ordre_dans_playlist), 0) AS maxOrdre
            FROM playlist_morceau
            WHERE playlist_id = ?
        `;

        const [rows] = await db.query(getMaxOrdreQuery, [playlistId]);
        let ordre = rows[0].maxOrdre || 0;

        const values = morceauxAInserer.map((morceauId) => {
            ordre++;
            return [playlistId, morceauId, ordre];
        });

        const insertQuery = `
            INSERT INTO playlist_morceau (playlist_id, morceau_id, ordre_dans_playlist)
            VALUES ?
        `;

        await db.query(insertQuery, [values]);

        return res.status(201).json({
            message: 'Morceaux ajoutés avec succès',
            playlistId,
            morceauxAjoutes: morceauxAInserer.length,
            dejaPresents: morceauxDejaPresents
        });
    } catch (err) {
        console.error('Erreur ajout morceaux playlist :', err);
        return res.status(500).json({
            error: 'Erreur serveur lors de l’ajout des morceaux à la playlist'
        });
    }
});


app.post('/api/playlists/:id/click', async (req, res) => {
    try {
        const id = req.params.id;
        await db.query('UPDATE playlist SET nb_clics = nb_clics + 1 WHERE id = ?', [id]);
        res.status(200).json({ message: 'Clic enregistré' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});


app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});


