INSERT INTO users (id, username, email, password, role_id) VALUES 
(41, 'admin', 'admin@dao.com', '$2b$10$wTvd0d0TXmjgX09vjNRQLeNRqqBStfXbQ4xvfTmrZO8Xxd0tPNTWK', 'Administrateur')
ON DUPLICATE KEY UPDATE username='admin', role_id='Administrateur';
