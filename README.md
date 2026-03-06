🚀 Installation du projet
1️⃣ Cloner le repository
git clone https://github.com/votre-repo/bitchestproject.git
cd bitchestproject

⚙️ Installation du Backend (Symfony)
Accéder au dossier backend
cd backend
Installer les dépendances
composer install
Configuration de l'environnement

Créer un fichier .env.local :

cp .env .env.local

Configurer la base de données :

DATABASE_URL="mysql://root:password@127.0.0.1:3306/bitchest"
Créer la base de données
php bin/console doctrine:database:create
Lancer les migrations
php bin/console doctrine:migrations:migrate
Démarrer le serveur backend

Avec Symfony CLI :

symfony server:start



Le backend sera disponible sur :

http://localhost:8000/
💻 Installation du Frontend (React)

Ouvrir un nouveau terminal.

Accéder au dossier frontend
cd frontend
Installer les dépendances
npm install
Lancer l'application
npm run dev
