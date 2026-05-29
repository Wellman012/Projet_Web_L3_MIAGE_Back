
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
        const [rows] = await db.query('SELECT id, nom AS titre, pseudo_createur AS createur, genre, nb_clics FROM playlist ORDER BY id');
        res.json(rows);
    } catch (error) {
        console.error('Erreur lors de la récupération des playlists :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
    // res.json(playlists)
});

app.get('/api/playlists/recherche', async (req, res) => {

    try {
        const name = req.query.name;
        const [rows] = await db.query('SELECT id, nom AS titre, pseudo_createur AS createur, genre, nb_clics FROM playlist WHERE nom LIKE ? ORDER BY id',
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
            'SELECT id, nom AS titre, pseudo_createur AS createur, genre, nb_clics FROM playlist ORDER BY nb_clics DESC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
app.get('/api/playlists/clicksDown', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, nom AS titre, pseudo_createur AS createur, genre, nb_clics FROM playlist ORDER BY nb_clics ASC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.get('/api/playlists/alphaUp', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, nom AS titre, pseudo_createur AS createur, genre, nb_clics FROM playlist ORDER BY nom DESC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
app.get('/api/playlists/alphaDown', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, nom AS titre, pseudo_createur AS createur, genre, nb_clics FROM playlist ORDER BY nom ASC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.get('/api/playlists/genreUp', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, nom AS titre, pseudo_createur AS createur, genre, nb_clics FROM playlist ORDER BY genre DESC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
app.get('/api/playlists/genreDown', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, nom AS titre, pseudo_createur AS createur, genre, nb_clics FROM playlist ORDER BY genre ASC'
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
            'SELECT id, nom AS titre, pseudo_createur AS createur, genre, nb_clics FROM playlist WHERE id = ?',
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
            `SELECT m.id, m.titre, m.artiste, m.genre, m.duree_secondes, pm.ordre_dans_playlist
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

// Supprimer un morceau d'une playlist
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
        const { titre, genre, createur } = req.body;
        const [result] = await db.query(
            'INSERT INTO playlist (nom, genre, pseudo_createur, nb_clics) VALUES (?, ?, ?, 0)',
            [titre, genre, createur]
        );
        res.status(201).json({ id: result.insertId, titre, genre, createur });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.get('/api/profil/:pseudo', async (req, res) => {
    try {
        const pseudo = req.params.pseudo;
        const [playlists] = await db.query(
            'SELECT id, nom AS titre, pseudo_createur AS createur, genre, nb_clics FROM playlist WHERE pseudo_createur = ? ORDER BY id',
            [pseudo]
        );
        const [contributions] = await db.query(
            `SELECT p.id, p.nom AS titre, p.pseudo_createur AS createur, p.genre, p.nb_clics 
             FROM playlist p
             JOIN playlist_contributeur pc ON p.id = pc.playlist_id
             JOIN user u ON pc.user_id = u.id
             WHERE u.pseudo = ? AND pc.role_contribution != 'createur'`,
            [pseudo]
        );
        const [genreRow] = await db.query(
            `SELECT genre, COUNT(*) as total FROM playlist 
             WHERE pseudo_createur = ? GROUP BY genre ORDER BY total DESC LIMIT 1`,
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

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});


