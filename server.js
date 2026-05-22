
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

app.get('/api/playlists/:id', (req, res) => {
    const id = Number(req.params.id);

    const playlist = playlists.find((p) => p.id === id);

    if (!playlist) {
        return res.status(404).json({ message: 'Playlist introuvable' })
    }
    return res.json(playlist)
});

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});

