const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const playlistsRoutes = require("./routes/playlists.routes");
const morceauxRoutes = require("./routes/morceaux.routes");
const profilRoutes = require("./routes/profil.routes");

const app = express();

// Active CORS pour autoriser les requêtes du front vers l'API
app.use(cors());

// Permet de lire les données JSON envoyées dans le body des requêtes
app.use(express.json());

// Rend les fichiers audio accessibles
app.use("/morceaux-fichiers", express.static(path.join(__dirname, "Morceaux")));

// Enregistre les différents groupes de routes de l'application sous /api
app.use("/api", authRoutes);
app.use("/api", playlistsRoutes);
app.use("/api", morceauxRoutes);
app.use("/api", profilRoutes);

module.exports = app;
