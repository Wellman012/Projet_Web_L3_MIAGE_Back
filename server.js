const app = require("./app");
const PORT = 3000;

// Démarre le serveur Express sur le port défini pour rendre l'API accessible
app.listen(PORT, () => {
    // Affiche dans la console l'adresse locale utilisée pour tester le back en développement
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
