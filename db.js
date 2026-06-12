const mysql = require("mysql2/promise");

// Crée un pool de connexions MySQL utilisé par toute l'application
// Le pool permet de limiter le nombre de connexions simultanées et d'améliorer les performances
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "music_app"
});

module.exports = pool;


