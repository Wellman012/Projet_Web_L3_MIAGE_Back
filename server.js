
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

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});


