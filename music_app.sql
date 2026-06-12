CREATE DATABASE IF NOT EXISTS music_app;
USE music_app;

CREATE TABLE genre (
    id INT AUTO_INCREMENT PRIMARY KEY,
    genre VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(20) NOT NULL
);

CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    pseudo VARCHAR(50) NOT NULL UNIQUE,
    mdp VARCHAR(255) NOT NULL,
    date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE morceau (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(150) NOT NULL,
    artiste VARCHAR(100) NOT NULL,
    chemin VARCHAR(200) NOT NULL
);

CREATE TABLE playlist (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    pseudo_createur VARCHAR(50) NOT NULL,
    genre INT NOT NULL,
    nb_clics INT NOT NULL DEFAULT 0,
    date_creation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_modification DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (genre) REFERENCES genre(id) ON DELETE CASCADE,
    FOREIGN KEY (pseudo_createur) REFERENCES user(pseudo)
);

CREATE TABLE playlist_morceau (
    playlist_id INT NOT NULL,
    morceau_id INT NOT NULL,
    ordre_dans_playlist INT NOT NULL,
    date_ajout DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (playlist_id, morceau_id),
    FOREIGN KEY (playlist_id) REFERENCES playlist(id) ON DELETE CASCADE,
    FOREIGN KEY (morceau_id) REFERENCES morceau(id) ON DELETE CASCADE
);

CREATE TABLE playlist_contributeur (
    playlist_id INT NOT NULL,
    user_id INT NOT NULL,
    role_contribution VARCHAR(50),
    date_ajout DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (playlist_id, user_id),
    FOREIGN KEY (playlist_id) REFERENCES playlist(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

INSERT INTO genre (id, genre, color)
VALUES
(1, 'Genre 1', '#e60000'),
(2, 'Genre 2', '#579e00'),
(3, 'Rock', '#2b04b9');

INSERT INTO user (id, nom, prenom, pseudo, mdp)
VALUES
(1, 'FERREIRA', 'Afonso', 'Af', 'Afonso'),
(2, 'FERREIRA', 'Afonso', 'Af2', 'Afonso'),
(3, 'FERREIRA', 'Afonso', 'Af3', 'Afonso'),
(4, 'FERREIRA', 'Afonso', 'Af4', 'Afonso'),
(5, 'FERREIRA', 'Afonso', 'Af5', 'Afonso'),
(6, 'FERREIRA', 'Afonso', 'Af6', 'Afonso'),
(8, 'FERREIRA', 'Afonso', 'Af7', 'Afonso');

INSERT INTO morceau (id, titre, artiste, chemin)
VALUES
(1, 'Jump', 'Van Halen', 'fichier-1781265069095.mp3'),
(2, 'Sounds Of Someday', 'Radio Company', 'fichier-1781265187187.mp3'),
(3, 'Hopin', 'Paul Davis', 'fichier-1781265242941.mp3'),
(4, 'Dead To Me', 'Sabrina Carpenter', 'fichier-1781265303075.mp3'),
(5, 'Paye Mon RSA', 'Tintin2Loin', 'fichier-1781265374999.mp3'),
(6, 'Take You Back', 'Sabrina Carpenter', 'fichier-1781265662866.mp3'),
(7, 'Expresso', 'Sabrina Carpenter', 'fichier-1781266667466.mp3'),
(8, 'Swim', 'BTS', 'fichier-1781267634223.mp3');

INSERT INTO playlist (id, nom, pseudo_createur, genre, nb_clics)
VALUES
(1, 'Playlist 1', 'Af', 1, 30),
(2, 'Play2', 'Af2', 2, 5),
(3, 'Rock', 'Af6', 3, 1);

INSERT INTO playlist_morceau (playlist_id, morceau_id, ordre_dans_playlist)
VALUES
(1, 1, 8),
(1, 2, 2),
(1, 3, 3),
(1, 4, 4),
(1, 5, 9),
(1, 6, 6),
(1, 7, 7),
(1, 8, 10),
(2, 8, 1);

INSERT INTO playlist_contributeur (playlist_id, user_id, role_contribution)
VALUES
(1, 1, 'createur'),
(1, 2, 'contributeur'),
(1, 3, 'contributeur'),
(1, 4, 'contributeur'),
(1, 5, 'contributeur'),
(2, 2, 'createur'),
(2, 6, 'contributeur'),
(3, 6, 'createur');