@echo off
echo 🐳 Test de configuration Docker pour DAO Project
echo ==============================================

REM Vérifier que Docker est en cours d'exécution
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker n'est pas en cours d'exécution
    pause
    exit /b 1
)

echo ✅ Docker est en cours d'exécution

REM Vérifier que les containers sont actifs
echo.
echo 📋 Vérification des containers Docker...

REM MySQL
docker ps | findstr "dao-mysql" >nul
if %errorlevel% equ 0 (
    echo ✅ Container MySQL: dao-mysql est actif
) else (
    echo ❌ Container MySQL: dao-mysql n'est pas actif
)

REM Application
docker ps | findstr "dao-app" >nul
if %errorlevel% equ 0 (
    echo ✅ Container App: dao-app est actif
) else (
    echo ❌ Container App: dao-app n'est pas actif
)

REM Redis
docker ps | findstr "dao-redis" >nul
if %errorlevel% equ 0 (
    echo ✅ Container Redis: dao-redis est actif
) else (
    echo ❌ Container Redis: dao-redis n'est pas actif
)

REM Nginx
docker ps | findstr "dao-nginx" >nul
if %errorlevel% equ 0 (
    echo ✅ Container Nginx: dao-nginx est actif
) else (
    echo ❌ Container Nginx: dao-nginx n'est pas actif
)

echo.
echo 🔐 Test de connexion à la base de données...

REM Test de connexion à MySQL
docker exec dao-mysql mysql -u dao_user -pdao_secure_password_2024 -e "SELECT 'Connection successful' as status;" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Connexion à MySQL réussie
    
    REM Vérifier que la base de données dao_project existe
    docker exec dao-mysql mysql -u dao_user -pdao_secure_password_2024 -e "USE dao_project; SELECT COUNT(*) as user_count FROM users WHERE email = 'admin@dao.com';" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Base de données dao_project accessible
        echo ✅ Utilisateur admin trouvé dans la base de données
    ) else (
        echo ❌ Impossible d'accéder à la base de données dao_project
    )
) else (
    echo ❌ Échec de la connexion à MySQL
)

echo.
echo 🌐 Test de connectivité réseau...

REM Test de l'application
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Application accessible sur http://localhost:3000
) else (
    echo ❌ Application non accessible sur http://localhost:3000
)

REM Test de Nginx
curl -s http://localhost >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Nginx accessible sur http://localhost
) else (
    echo ❌ Nginx non accessible sur http://localhost
)

echo.
echo 📝 Instructions de connexion:
echo ============================
echo Email: admin@dao.com
echo Mot de passe: admin123
echo Rôle: Administrateur (role_id: 2)
echo.
echo 🔗 URLs d'accès:
echo - Application: http://localhost:3000
echo - Dashboard Admin: http://localhost:3000/dash/admin
echo - PHPMyAdmin: http://localhost:8080 (si activé)
echo.
echo 🐳 Commandes utiles:
echo - Démarrer: docker-compose up -d
echo - Arrêter: docker-compose down
echo - Logs: docker-compose logs -f [service]
echo - Exécuter test-connection.sql: docker exec -i dao-mysql mysql -u dao_user -pdao_secure_password_2024 dao_project ^< test-connection.sql

echo.
echo =============================================
echo 🎉 Test terminé!
pause
