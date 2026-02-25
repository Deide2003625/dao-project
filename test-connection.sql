-- Test de connexion pour vérifier la configuration Docker
-- Ce script peut être exécuté pour tester la connexion à la base de données

-- Test 1: Vérifier que la base de données existe
USE `dao_project`;

-- Test 2: Vérifier que l'utilisateur admin existe
SELECT 'Vérification utilisateur admin:' AS test;
SELECT id, username, email, role_id FROM users WHERE email = 'admin@dao.com';

-- Test 3: Vérifier que les rôles existent
SELECT 'Vérification des rôles:' AS test;
SELECT * FROM roles;

-- Test 4: Vérifier la connexion avec le hash bcrypt
SELECT 'Test de hash bcrypt (admin123):' AS test;
SELECT '$2b$10$wTvd0d0TXmjgX09vjNRQLeNRqqBStfXbQ4xvfTmrZO8Xxd0tPNTWK' AS stored_hash;

-- Test 5: Vérifier que les tables nécessaires existent
SELECT 'Vérification des tables:' AS test;
SHOW TABLES;

-- Test 6: Compter les utilisateurs par rôle
SELECT 'Utilisateurs par rôle:' AS test;
SELECT r.name, COUNT(u.id) as user_count 
FROM roles r 
LEFT JOIN users u ON r.id = u.role_id 
GROUP BY r.id, r.name 
ORDER BY r.id;
