# Guide d'utilisation - DAO Project

## 📋 Vue d'ensemble

Le **DAO Project** est une application web de gestion de Demandes d'Appel d'Offres (DAO) développée avec Next.js, TypeScript et MySQL. Elle permet aux équipes de collaborer efficacement sur la gestion des appels d'offres avec des rôles et permissions bien définis.

## 🏗️ Architecture Technique

### Stack Technique
- **Frontend**: Next.js 16 avec TypeScript
- **Styling**: TailwindCSS + Bootstrap
- **Base de données**: MySQL
- **Authentification**: NextAuth.js avec bcrypt
- **UI Components**: Lucide React, FontAwesome

### Structure des dossiers
```
dao-project/
├── app/                    # Pages Next.js (App Router)
│   ├── api/               # Routes API
│   ├── dash/              # Tableaux de bord par rôle
│   ├── login/             # Page de connexion
│   └── profile/           # Profil utilisateur
├── components/            # Composants React réutilisables
├── lib/                   # Utilitaires et configuration DB
├── scripts/               # Scripts de peuplement DB
├── public/                # Fichiers statiques
└── styles/                # Feuilles de style
```

## 🔐 Rôles et Permissions

### Hiérarchie des rôles
1. **MEMBRE_EQUIPE** (Niveau 1) - Accès de base
2. **CHEF_PROJET** (Niveau 5) - Gestion de projets
3. **ADMIN** (Niveau 8) - Administration système
4. **DIRECTEUR** (Niveau 9) - Supervision générale
5. **SUPER_ADMIN** (Niveau 10) - Contrôle total

### Accès par rôle
- **Membre d'équipe**: Vue des tâches assignées, commentaires
- **Chef de projet**: Gestion des DAO, assignation des tâches
- **Admin**: Gestion des utilisateurs, configuration système
- **Directeur**: Vue d'ensemble, rapports
- **Super Admin**: Contrôle total de l'application

## 🚀 Installation et Configuration

### Prérequis
- Node.js 18+ et npm
- MySQL Server
- Un éditeur de code (VS Code recommandé)

### Étapes d'installation

1. **Cloner le projet**
```bash
git clone [repository-url]
cd dao-project
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer la base de données**
```sql
CREATE DATABASE dao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. **Créer le fichier .env.local**
```env
DB_HOST=localhost
DB_USER=votre_utilisateur_mysql
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=dao
DB_PORT=3306

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre-secret-securise
```

5. **Peupler la base de données**
```bash
# Option recommandée : peuplement complet
npx ts-node scripts/seed-complete.ts
```

## 📱 Utilisation de l'Application

### Connexion

1. Lancez le serveur de développement:
```bash
npm run dev
```

2. Ouvrez `http://localhost:3000` dans votre navigateur

3. Utilisez les comptes par défaut:
   - **Admin**: `admin@dao.com` / `admin123`
   - **Super Admin**: `superadmin@dao.com` / `superadmin123`
   - **Chef de projet**: `chef1@dao.com` / `chef123`
   - **Membre**: `user1@dao.com` / `user123`

### Tableaux de bord

#### Chef de Projet (`/dash/ChefProjet`)
- **Vue d'ensemble**: Statistiques des DAO (total, en cours, à risque, terminées)
- **Gestion des DAO**: Liste complète avec filtrage et recherche
- **Commentaires**: Système de messagerie avec mentions @
- **Assignation**: Distribution des tâches aux membres

#### Directeur Général (`/dash/DirecteurGeneral`)
- Vue stratégique de tous les projets
- Rapports et analyses
- Validation des décisions importantes

#### Membre d'Équipe (`/dash/MembreEquipe`)
- Tâches personnelles assignées
- Suivi du progrès
- Communication avec l'équipe

#### Administration (`/dash/admin`)
- Gestion des utilisateurs
- Configuration des rôles
- Maintenance système

## 💡 Fonctionnalités Clés

### 1. Gestion des DAO
- Création et modification des demandes d'appel d'offres
- Suivi des statuts (En cours, À risque, Terminé)
- Assignation automatique aux chefs de projet

### 2. Système de Commentaires
- Commentaires publics et privés
- Mentions @utilisateurs
- Notifications en temps réel
- Historique complet des discussions

### 3. Gestion des Équipes
- Création d'équipes de travail
- Assignation des membres
- Collaboration structurée

### 4. Suivi des Tâches
- Distribution des responsabilités
- Suivi de l'avancement
- Rapports de progression

## 🔧 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Informations utilisateur

### DAO
- `GET /api/dao` - Lister les DAO
- `POST /api/dao` - Créer un DAO
- `PUT /api/dao/[id]` - Modifier un DAO
- `DELETE /api/dao/[id]` - Supprimer un DAO

### Utilisateurs
- `GET /api/users` - Lister les utilisateurs
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/[id]` - Modifier un utilisateur

### Messages
- `GET /api/messages` - Lister les messages
- `POST /api/messages` - Envoyer un message

## 🗄️ Structure de la Base de Données

### Tables principales
- **users**: Informations utilisateurs et rôles
- **roles**: Définition des permissions
- **teams**: Équipes de travail
- **team_members**: Association utilisateurs-équipes
- **daos**: Demandes d'appel d'offres
- **messages**: Communications internes
- **notifications**: Alertes système

### Relations clés
- Un utilisateur appartient à un rôle
- Un utilisateur peut être dans plusieurs équipes
- Un DAO est assigné à un chef de projet
- Les messages peuvent être publics ou privés

## 🛠️ Développement

### Scripts disponibles
```bash
npm run dev        # Serveur de développement
npm run build      # Build de production
npm run start      # Serveur de production
npm run lint       # Analyse du code
npm run seed       # Peuplement DB
```

### Structure des composants
- Les composants sont dans `/components`
- Les pages utilisent le pattern App Router de Next.js
- Les API routes sont dans `/app/api`

### Bonnes pratiques
- Utiliser TypeScript pour la sécurité des types
- Suivre les conventions de nommage
- Documenter les nouvelles fonctionnalités
- Tester avant de déployer

## 🔍 Dépannage

### Problèmes courants

**Erreur de connexion DB**
- Vérifiez que MySQL est en cours d'exécution
- Confirmez les identifiants dans `.env.local`
- Assurez-vous que la base `dao` existe

**Page blanche après connexion**
- Vérifiez les logs du serveur
- Confirmez la configuration NextAuth
- Nettoyez les cookies du navigateur

**Données non affichées**
- Exécutez le script de seed
- Vérifiez les permissions utilisateur
- Consultez les logs API

### Commandes utiles
```bash
# Vérifier la structure DB
npx ts-node -e "import { verifyDatabaseStructure } from './lib/db'; verifyDatabaseStructure();"

# Repartir de zéro
DROP TABLE IF EXISTS team_members, teams, daos, roles, users;
```

## 📞 Support

Pour toute question ou problème:
1. Consultez ce guide
2. Vérifiez les logs de l'application
3. Contactez l'administrateur système

---

**Version**: 1.0.0  
**Dernière mise à jour**: 2025  
**Développé par**: 2SND Technologies
