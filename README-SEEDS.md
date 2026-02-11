# Seeds pour Administrateurs - DAO Project

Ce dossier contient plusieurs scripts de peuplement (seeds) pour votre base de données DAO.

## 📁 Fichiers disponibles

### 1. `seed-admin.ts` 
**Usage**: Créer uniquement les utilisateurs administrateurs
```bash
npx ts-node scripts/seed-admin.ts
```

**Comptes créés**:
- `admin@dao.com` / `admin123` (ADMIN)
- `superadmin@dao.com` / `superadmin123` (SUPER_ADMIN)
- `lio@dao.com` / `lio123` (ADMIN)
- `directeur@dao.com` / `directeur123` (DIRECTEUR)

### 2. `seed-roles.ts`
**Usage**: Créer la table des rôles et la peupler
```bash
npx ts-node scripts/seed-roles.ts
```

**Rôles créés**:
- `MEMBRE_EQUIPE` (niveau 1)
- `CHEF_PROJET` (niveau 5)
- `ADMIN` (niveau 8)
- `DIRECTEUR` (niveau 9)
- `SUPER_ADMIN` (niveau 10)

### 3. `seed-complete.ts` ⭐ **RECOMMANDÉ**
**Usage**: Peuplement complet de la base de données (rôles + utilisateurs + équipes)
```bash
npx ts-node scripts/seed-complete.ts
```

**Contenu**:
- ✅ Tous les rôles
- ✅ 10 utilisateurs (administrateurs, chefs de projet, membres)
- ✅ 3 équipes
- ✅ Assignations des membres aux équipes

### 4. `seed.ts` (existant)
**Usage**: Script original avec données mixtes
```bash
npx ts-node scripts/seed.ts
```

## 🚀 Lancement rapide

### Option 1: Peuplement complet (recommandé)
```bash
# Assurez-vous que votre .env.local est configuré
npx ts-node scripts/seed-complete.ts
```

### Option 2: Administrateurs uniquement
```bash
npx ts-node scripts/seed-admin.ts
```

## 📋 Prérequis

1. **Base de données MySQL** configurée dans `.env.local`
2. **Node.js** et TypeScript installés
3. **Dépendances** installées (`npm install`)

## 🔧 Configuration .env.local

```env
DB_HOST=localhost
DB_USER=votre_utilisateur_mysql
DB_PASSWORD=votre_mot_de_passe_mysql
DB_NAME=dao
DB_PORT=3306
```

## 🏗️ Structure créée

### Tables
- `users` - Utilisateurs avec rôles
- `roles` - Définition des rôles et permissions
- `teams` - Équipes de travail
- `team_members` - Association utilisateurs-équipes

### Hiérarchie des rôles
1. **MEMBRE_EQUIPE** - Accès de base
2. **CHEF_PROJET** - Gestion de projets
3. **ADMIN** - Administration système
4. **DIRECTEUR** - Supervision générale
5. **SUPER_ADMIN** - Contrôle total

## 🔐 Comptes par défaut

Après exécution de `seed-complete.ts`:

### Administrateurs
| Email | Username | Rôle | Mot de passe |
|-------|----------|------|-------------|
| admin@dao.com | admin | ADMIN | admin123 |
| superadmin@dao.com | superadmin | SUPER_ADMIN | superadmin123 |
| lio@dao.com | lio | ADMIN | lio123 |
| directeur@dao.com | directeur | DIRECTEUR | directeur123 |

### Autres utilisateurs
| Email | Username | Rôle | Mot de passe |
|-------|----------|------|-------------|
| manager@dao.com | manager1 | CHEF_PROJET | manager123 |
| chef1@dao.com | chef_projet1 | CHEF_PROJET | chef123 |
| user1@dao.com | user1 | MEMBRE_EQUIPE | user123 |
| user2@dao.com | user2 | MEMBRE_EQUIPE | user123 |
| dev1@dao.com | dev1 | MEMBRE_EQUIPE | dev123 |
| membre1@dao.com | membre1 | MEMBRE_EQUIPE | membre123 |

## 🛠️ Dépannage

### Erreur "TABLE users n'existe pas"
```bash
# Vérifiez la structure de la base de données
npx ts-node -e "
import { verifyDatabaseStructure } from './lib/db';
verifyDatabaseStructure().then(() => console.log('Structure vérifiée'));
"
```

### Erreur de connexion MySQL
- Vérifiez que MySQL est en cours d'exécution
- Vérifiez les identifiants dans `.env.local`
- Assurez-vous que la base de données `dao` existe

### Nettoyage complet (si nécessaire)
```sql
-- Pour repartir de zéro
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS daos;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;
```

## 📝 Notes importantes

- Les mots de passe sont hashés avec bcrypt (salt rounds: 10)
- Les emails sont uniques dans la base de données
- Les scripts sont idempotents (peuvent être exécutés plusieurs fois)
- La structure utilise VARCHAR pour role_id (cohérent avec la table users)
