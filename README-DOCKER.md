# 🐳 Dockerisation du Projet DAO

## 📋 Fichiers Créés

✅ `Dockerfile` - Build multi-stage optimisé pour production  
✅ `docker-compose.yml` - Orchestration complète avec MySQL, Redis, Nginx  
✅ `.dockerignore` - Optimisation du build Docker  
✅ `nginx.conf` - Reverse proxy avec sécurité et performance  
✅ `env-production.example` - Template configuration production  
✅ `init.sql` - Initialisation automatique de la base de données  

## 🚀 Démarrage Rapide

### 1. Prérequis
```bash
# Installer Docker Desktop
# Installer Docker Compose
```

### 2. Configuration
```bash
# Copier le template de configuration
cp env-production.example .env.production

# Éditer les variables importantes
nano .env.production
```

**Variables obligatoires à modifier :**
- `NEXTAUTH_SECRET` : `openssl rand -base64 32`
- `JWT_SECRET` : `openssl rand -base64 32`
- `DB_PASSWORD` : Mot de passe MySQL fort
- `EMAIL_PASSWORD` : Mot de passe application Gmail

### 3. Lancement
```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

## 🌐 Accès aux Services

- **Application** : http://localhost:3000
- **API** : http://localhost:3000/api/
- **MySQL** : localhost:3306
- **Redis** : localhost:6379
- **Nginx** : http://localhost:80
- **PHPMyAdmin** : http://localhost:8080 (optionnel)

## 🔧 Commandes Utiles

### Gestion des containers
```bash
# Voir l'état des services
docker-compose ps

# Redémarrer un service
docker-compose restart app

# Voir les logs d'un service
docker-compose logs app

# Exécuter une commande dans un container
docker-compose exec app sh
```

### Base de données
```bash
# Se connecter à MySQL
docker-compose exec mysql mysql -u dao_user -p dao_project

# Sauvegarder la base de données
docker-compose exec mysql mysqldump -u dao_user -p dao_project > backup.sql

# Restaurer la base de données
docker-compose exec -T mysql mysql -u dao_user -p dao_project < backup.sql
```

### Développement
```bash
# Build avec cache
docker-compose build --no-cache

# Forcer le rebuild
docker-compose build --no-cache app

# Mode développement (avec hot reload)
docker-compose -f docker-compose.dev.yml up
```

## 📊 Monitoring

### Health Checks
```bash
# Vérifier l'état de santé
curl http://localhost:3000/api/health
curl http://localhost:80/health
```

### Logs
```bash
# Logs en temps réel
docker-compose logs -f app mysql redis nginx

# Logs spécifiques
docker-compose logs --tail=100 app
```

## 🔒 Sécurité

### En Production
1. **Changer tous les secrets** dans `.env.production`
2. **Utiliser HTTPS** avec Nginx (décommenter la section SSL)
3. **Limiter les accès** avec firewall
4. **Surveiller les logs** régulièrement

### Certificats SSL
```bash
# Générer certificats auto-signés (développement)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem

# Utiliser Let's Encrypt (production)
certbot --nginx -d votre-domaine.com
```

## 🚨 Dépannage

### Problèmes Communs

**Port déjà utilisé :**
```bash
# Voir qui utilise le port
netstat -tulpn | grep :3000

# Changer le port dans docker-compose.yml
ports:
  - "3001:3000"
```

**Problèmes de permissions :**
```bash
# Donner les permissions aux volumes
sudo chown -R $USER:$USER ./uploads
sudo chmod -R 755 ./uploads
```

**MySQL ne démarre pas :**
```bash
# Vérifier les logs MySQL
docker-compose logs mysql

# Réinitialiser le volume MySQL
docker-compose down -v
docker-compose up mysql
```

**Build lent :**
```bash
# Optimiser le build avec cache
docker-compose build --progress=plain

# Nettoyer les images inutilisées
docker system prune -a
```

## 📈 Performance

### Optimisations
- **Cache Redis** pour les sessions et données fréquemment accédées
- **Gzip Nginx** pour compression des réponses
- **Cache statique** pour les assets Next.js
- **Rate limiting** pour protéger contre les abus

### Monitoring avancé
```bash
# Installer Prometheus + Grafana
docker-compose -f docker-compose.monitoring.yml up -d

# Voir les métriques
http://localhost:3000  # Application
http://localhost:9090  # Prometheus
http://localhost:3001  # Grafana
```

## 🔄 Mise à Jour

### Mise à jour de l'application
```bash
# Puller les nouveaux changements
git pull

# Rebuild et restart
docker-compose build --no-cache app
docker-compose up -d app
```

### Migration de base de données
```bash
# Exécuter les migrations
docker-compose exec app npm run migrate

# Vérifier la structure
docker-compose exec mysql mysql -u dao_user -p -e "SHOW TABLES;"
```

## 📞 Support

En cas de problème :
1. Vérifier les logs : `docker-compose logs`
2. Consulter la documentation Next.js Docker
3. Vérifier la configuration réseau
4. Valider les variables d'environnement

---

**Note :** Cette configuration est optimisée pour la production mais peut être adaptée pour le développement en utilisant des volumes pour le code source.
