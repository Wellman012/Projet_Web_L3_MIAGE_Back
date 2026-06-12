const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const playlistsRoutes = require("./routes/playlists.routes");
const morceauxRoutes = require("./routes/morceaux.routes");
const profilRoutes = require("./routes/profil.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/morceaux-fichiers", express.static(path.join(__dirname, "Morceaux")));

app.use("/api", authRoutes);
app.use("/api", playlistsRoutes);
app.use("/api", morceauxRoutes);
app.use("/api", profilRoutes);

module.exports = app;
