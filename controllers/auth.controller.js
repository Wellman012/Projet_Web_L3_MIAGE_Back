const authRepository = require('../repositories/auth.repository');

async function verifierPseudo(req, res) {
    try {
        const pseudo = req.params.pseudo;
        const rows = await authRepository.findUserByPseudo(pseudo);
        res.json({ exists: rows.length > 0 });
    } catch (error) {
        console.error('Erreur dans verifierPseudo :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

async function inscription(req, res) {
    try {
        const { nom, prenom, pseudo, motDePasse } = req.body;

        const result = await authRepository.createUser(nom, prenom, pseudo, motDePasse);

        res.status(201).json({
            id: result.insertId,
            nom,
            prenom,
            pseudo
        });
    } catch (error) {
        console.error('Erreur dans inscription :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

async function connexion(req, res) {
    try {
        const { pseudo, motDePasse } = req.body;

        const rows = await authRepository.findUserByCredentials(pseudo, motDePasse);

        if (rows.length > 0) {
            res.json({ pseudo: rows[0].pseudo });
        } else {
            res.status(401).json({ message: 'Identifiants incorrects' });
        }
    } catch (error) {
        console.error('Erreur dans connexion :', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

module.exports = {
    verifierPseudo,
    inscription,
    connexion
};