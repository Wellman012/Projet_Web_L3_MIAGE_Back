# Utilise une image Node.js prête à l'emploi pour exécuter l'application
FROM node:20

# Définit le dossier de travail dans le conteneur
WORKDIR /app

# Copie uniquement les fichiers de dépendances pour optimiser le cache Docker lors des builds
COPY package*.json ./

# Installe les dépendances nécessaires au projet
RUN npm install

# Copie le reste du code de l'application dans le conteneur
COPY . .

# Indique que l'application utilise le port 3000
EXPOSE 3000

# Lance le serveur Node.js avec la commande définie dans package.json
CMD ["npm", "start"]
