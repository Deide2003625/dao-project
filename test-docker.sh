#!/bin/bash

echo "🐳 Test de configuration Docker pour DAO Project"
echo "=============================================="

# Vérifier que Docker est en cours d'exécution
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker n'est pas en cours d'exécution"
    exit 1
fi

echo "✅ Docker est en cours d'exécution"

# Vérifier que les containers sont actifs
echo ""
echo "📋 Vérification des containers Docker..."

# MySQL
if docker ps | grep -q "dao-mysql"; then
    echo "✅ Container MySQL: dao-mysql est actif"
else
    echo "❌ Container MySQL: dao-mysql n'est pas actif"
fi

# Application
if docker ps | grep -q "dao-app"; then
    echo "✅ Container App: dao-app est actif"
else
    echo "❌ Container App: dao-app n'est pas actif"
fi

# Redis
if docker ps | grep -q "dao-redis"; then
    echo "✅ Container Redis: dao-redis est actif"
else
    echo "❌ Container Redis: dao-redis n'est pas actif"
fi

# Nginx
if docker ps | grep -q "dao-nginx"; then
    echo "✅ Container Nginx: dao-nginx est actif"
else
    echo "❌ Container Nginx: dao-nginx n'est pas actif"
fi

echo ""
echo "🔐 Test de connexion à la base de données..."

# Test de connexion à MySQL
if docker exec dao-mysql mysql -u dao_user -pdao_secure_password_2024 -e "SELECT 'Connection successful' as status;" > /dev/null 2>&1; then
    echo "✅ Connexion à MySQL réussie"
    
    # Vérifier que la base de données dao_project existe
    if docker exec dao-mysql mysql -u dao_user -pdao_secure_password_2024 -e "USE dao_project; SELECT COUNT(*) as user_count FROM users WHERE email = 'admin@dao.com';" > /dev/null 2>&1; then
        echo "✅ Base de données dao_project accessible"
        
        # Compter les utilisateurs
        user_count=$(docker exec dao-mysql mysql -u dao_user -pdao_secure_password_2024 -e "USE dao_project; SELECT COUNT(*) FROM users WHERE email = 'admin@dao.com';" -s -N)
        if [ "$user_count" -eq 1 ]; then
            echo "✅ Utilisateur admin trouvé dans la base de données"
        else
            echo "❌ Utilisateur admin non trouvé (count: $user_count)"
        fi
    else
        echo "❌ Impossible d'accéder à la base de données dao_project"
    fi
else
    echo "❌ Échec de la connexion à MySQL"
fi

echo ""
echo "🌐 Test de connectivité réseau..."

# Test de l'application
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Application accessible sur http://localhost:3000"
else
    echo "❌ Application non accessible sur http://localhost:3000"
fi

# Test de Nginx
if curl -s http://localhost > /dev/null 2>&1; then
    echo "✅ Nginx accessible sur http://localhost"
else
    echo "❌ Nginx non accessible sur http://localhost"
fi

echo ""
echo "📝 Instructions de connexion:"
echo "============================"
echo "Email: admin@dao.com"
echo "Mot de passe: admin123"
echo "Rôle: Administrateur (role_id: 2)"
echo ""
echo "🔗 URLs d'accès:"
echo "- Application: http://localhost:3000"
echo "- Dashboard Admin: http://localhost:3000/dash/admin"
echo "- PHPMyAdmin: http://localhost:8080 (si activé)"
echo ""
echo "🐳 Commandes utiles:"
echo "- Démarrer: docker-compose up -d"
echo "- Arrêter: docker-compose down"
echo "- Logs: docker-compose logs -f [service]"
echo "- Exécuter test-connection.sql: docker exec -i dao-mysql mysql -u dao_user -pdao_secure_password_2024 dao_project < test-connection.sql"

echo ""
echo "============================================"
echo "🎉 Test terminé!"
