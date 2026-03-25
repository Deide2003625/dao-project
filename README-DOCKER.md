# 🐳 Docker — Projet DAO

## 📋 Fichiers présents

| Fichier              | Rôle                                                 |
| -------------------- | ---------------------------------------------------- |
| `Dockerfile.working` | Build multi-stage optimisé (deps → builder → runner) |
| `docker-compose.yml` | Orchestration : `dao-app` + `dao-mysql`              |
| `.dockerignore`      | Exclusion des fichiers inutiles du contexte de build |
| `.env.example`       | Template de configuration (à copier en `.env`)       |
| `init.sql`           | Initialisation automatique de la base de données     |
| `redeploy.sh`        | Script de redéploiement complet                      |

---

## 🚀 Démarrage rapide

### 1. Prérequis

```bash
# Vérifier que Docker est installé
docker --version
docker compose version
```

### 2. Configuration

```bash
# Copier le template
cp .env.example .env

# Éditer les variables (ports, mots de passe, secrets)
nano .env
```

**Variables obligatoires à modifier dans `.env` :**

```bash
# Générer des secrets sécurisés
openssl rand -base64 32   # pour NEXTAUTH_SECRET
openssl rand -base64 32   # pour JWT_SECRET
```

| Variable              | Description                               |
| --------------------- | ----------------------------------------- |
| `NEXTAUTH_SECRET`     | Clé secrète NextAuth (min. 32 caractères) |
| `JWT_SECRET`          | Clé secrète JWT (min. 32 caractères)      |
| `DB_PASSWORD`         | Mot de passe MySQL de l'utilisateur       |
| `MYSQL_ROOT_PASSWORD` | Mot de passe root MySQL                   |
| `EMAIL_PASSWORD`      | Mot de passe d'application Gmail          |

### 3. Lancement

```bash
# Premier lancement
docker compose up -d

# Vérifier que tout tourne
docker compose ps

# Suivre les logs en temps réel
docker compose logs -f
```

### 4. Accès

| Service             | URL                                          |
| ------------------- | -------------------------------------------- |
| Application Next.js | http://localhost:`$APP_PORT` (défaut : 3000) |
| API                 | http://localhost:`$APP_PORT`/api/            |
| MySQL               | localhost:`$MYSQL_PORT` (défaut : 3306)      |

---

## ⚙️ Configuration des ports

Tous les ports sont configurables dans le fichier `.env` sans toucher au `docker-compose.yml`.

```env
# .env
APP_PORT=3000       # Port de l'application Next.js
MYSQL_PORT=3306     # Port MySQL exposé sur le host
```

**Si un port est déjà utilisé sur ta machine :**

```bash
# Vérifier les ports occupés
sudo ss -tlnp | grep 3306

# Identifier quel conteneur Docker utilise ce port
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep 3306

# Modifier le port dans .env puis relancer
nano .env
docker compose down
docker compose up -d
```

---

## 🔄 Redéploiement

### Après modification du `.env`

```bash
# Cas 1 — Changement de port host uniquement (APP_PORT, MYSQL_PORT)
# Pas besoin de rebuild, Docker recrée juste le mapping
docker compose down
docker compose up -d

# Cas 2 — Changement du port interne de l'application
# Rebuild obligatoire car PORT est passé en ARG au Dockerfile
docker compose down
docker compose build --no-cache
docker compose up -d
docker compose logs app --tail=30
```

### Script de redéploiement complet

```bash
# Créer le script
cat > redeploy.sh << 'EOF'
#!/bin/bash
echo "Arret des conteneurs..."
docker compose down

echo "Rebuild de l image..."
docker compose build --no-cache

echo "Demarrage..."
docker compose up -d

echo "Statut :"
docker compose ps
EOF

chmod +x redeploy.sh

# Utilisation
./redeploy.sh
```

---

## 🔧 Commandes utiles

### Gestion des conteneurs

```bash
# Voir l'état des services
docker compose ps

# Démarrer un service spécifique
docker compose up -d app
docker compose up -d mysql

# Redémarrer un service
docker compose restart app

# Arrêter tous les services
docker compose down

# Arrêter et supprimer les volumes (reset complet)
docker compose down -v --remove-orphans

# Entrer dans le conteneur app
docker compose exec app sh

# Entrer dans le conteneur MySQL
docker compose exec mysql sh
```

### Logs

```bash
# Logs en temps réel (tous les services)
docker compose logs -f

# Logs d'un service spécifique
docker compose logs -f app
docker compose logs -f mysql

# 100 dernières lignes
docker compose logs --tail=100 app
```

### Build

```bash
# Build standard
docker compose build

# Build sans cache (à utiliser après modification du Dockerfile)
docker compose build --no-cache

# Build d'un seul service
docker compose build --no-cache app

# Build avec affichage détaillé
docker compose build --progress=plain app
```

---

## 🗄️ Base de données

```bash
# Se connecter à MySQL depuis le conteneur
docker compose exec mysql mysql -u dao_user -pdao_secure_password_2024 dao

# Sauvegarder la base de données
docker compose exec mysql mysqldump \
  -u dao_user -pdao_secure_password_2024 dao > backup_$(date +%Y%m%d).sql

# Restaurer une sauvegarde
docker compose exec -T mysql mysql \
  -u dao_user -pdao_secure_password_2024 dao < backup.sql

# Voir les tables
docker compose exec mysql mysql \
  -u dao_user -pdao_secure_password_2024 \
  -e "USE dao; SHOW TABLES;"
```

---

## 🌐 Réseau Docker

### Problème de conflit de subnet

Si tu obtiens l'erreur :

```
failed to create network: invalid pool request: Pool overlaps with other one on this address space
```

```bash
# Voir tous les réseaux et leurs subnets
docker network inspect $(docker network ls -q) \
  --format '{{.Name}} : {{range .IPAM.Config}}{{.Subnet}}{{end}}'

# Supprimer les réseaux inutilisés (conteneurs arrêtés)
docker network prune

# Si le conflit persiste (réseau utilisé par un conteneur actif)
# → modifier DOCKER_SUBNET dans .env avec un range libre
# Exemple : éviter 172.17, 172.20, 172.21 si déjà pris
nano .env
# DOCKER_SUBNET=172.25.0.0/16
# DOCKER_GATEWAY=172.25.0.1

docker compose down
docker compose up -d
```

---

## 🚨 Dépannage

### Port déjà utilisé

```bash
# Identifier ce qui utilise le port
sudo lsof -i :3306
sudo ss -tlnp | grep 3306

# Si c'est un processus MariaDB/MySQL local
sudo systemctl stop mariadb
sudo systemctl stop mysql

# Si c'est un conteneur Docker d'un autre projet
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep 3306
docker stop <nom-du-conteneur>

# Forcer la libération du port
sudo fuser -k 3306/tcp

# Vérifier que le port est libéré
sudo ss -tlnp | grep 3306
```

### L'application ne démarre pas

```bash
# Vérifier les logs
docker compose logs app

# Vérifier que MySQL est prêt avant l'app
docker compose logs mysql

# Tester le healthcheck manuellement
curl http://localhost:3000/api/health

# Vérifier les variables d'environnement du conteneur
docker compose exec app env | grep -E "DB_|NODE_|PORT"
```

### Erreur de build Next.js — module introuvable

Si tu obtiens :

```
Error: Cannot find module 'autoprefixer'
```

Le `NODE_ENV` était mal configuré pendant le build.
Le Dockerfile corrigé utilise `NODE_ENV=development` dans le stage builder
pour que toutes les devDependencies soient disponibles.

```bash
# Rebuild sans cache pour appliquer le fix
docker compose build --no-cache app
docker compose up -d
```

### MySQL ne démarre pas

```bash
# Voir les logs MySQL
docker compose logs mysql

# Réinitialiser complètement le volume MySQL
# ⚠️ Supprime toutes les données
docker compose down -v
docker compose up -d
docker system prune -a --volumes -f
```

### Erreur de permissions sur les volumes

```bash
# Donner les permissions sur les dossiers locaux
sudo chown -R $USER:$USER ./uploads ./logs
sudo chmod -R 755 ./uploads ./logs
```

### node_modules trop volumineux dans Git

Si tu as commité `node_modules` par erreur et que le push échoue :

```
File node_modules/... is 112.45 MB; this exceeds GitHub's file size limit
```

```bash
# Supprimer node_modules du tracking Git
git rm -r --cached node_modules

# Ajouter au .gitignore
echo "node_modules/" >> .gitignore
git add .gitignore
git commit -m "fix: remove node_modules from git tracking"

# Réécrire l'historique pour supprimer node_modules de tous les commits
pip install git-filter-repo
git filter-repo --path node_modules --invert-paths

# Forcer le push
git push origin <branche> --force
```

### Nettoyage général Docker

```bash
# Supprimer les conteneurs arrêtés, images non utilisées, réseaux orphelins
docker system prune

# Supprimer aussi les volumes non utilisés
docker system prune --volumes

# Supprimer toutes les images non utilisées (libère beaucoup d'espace)
docker system prune -a

# Voir l'espace utilisé par Docker
docker system df
```

---

## 🔒 Sécurité

### Checklist avant déploiement en production

```bash
# [ ] NEXTAUTH_SECRET généré avec openssl rand -base64 32
# [ ] JWT_SECRET généré avec openssl rand -base64 32
# [ ] DB_PASSWORD fort (min. 16 caractères)
# [ ] MYSQL_ROOT_PASSWORD fort (min. 16 caractères)
# [ ] .env dans le .gitignore
# [ ] node_modules dans le .gitignore
# [ ] APP_URL et NEXTAUTH_URL pointent vers le vrai domaine
```

```bash
# Vérifier que .env n'est pas tracké par Git
git status | grep .env
cat .gitignore | grep .env
```

---

## 📁 Structure des fichiers Docker

```
projet/
├── Dockerfile.working        # Build multi-stage (deps → builder → runner)
├── docker-compose.yml        # Services : dao-app + dao-mysql
├── .dockerignore             # Exclusions du contexte de build
├── .env.example              # Template de configuration
├── .env                      # Configuration locale (non commité)
├── init.sql                  # Initialisation de la BDD au premier lancement
└── redeploy.sh               # Script de redéploiement
```

### Architecture Docker

```
┌─────────────────────────────────────────────┐
│              docker-compose                  │
│                                             │
│   ┌─────────────┐     ┌─────────────────┐  │
│   │   dao-app   │────▶│   dao-mysql     │  │
│   │  Next.js    │     │   MySQL 8.0     │  │
│   │  :APP_PORT  │     │  :MYSQL_PORT    │  │
│   └─────────────┘     └─────────────────┘  │
│                                             │
│   Réseau : dao-network (172.25.0.0/16)      │
└─────────────────────────────────────────────┘
```
