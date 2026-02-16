// Test complet des APIs avec la même logique que le code
const mysql = require('mysql2/promise');

// Configuration de la base
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'dao',
  port: 3306
};

async function testCompleteAPIs() {
  let connection;
  try {
    console.log('=== TEST COMPLET DES APIS ===');
    
    // Connexion
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connexion à la base réussie');
    
    // Test 1: API Users (GET)
    console.log('\n--- Test API Users (GET) ---');
    const [users] = await connection.execute(
      `SELECT id, username, email, url_photo, role_id FROM users ORDER BY username ASC`
    );
    console.log('Utilisateurs trouvés:', users.length);
    
    // Normaliser comme l'API
    const normalizedUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      name: user.username,
      email: user.email,
      url_photo: user.url_photo,
      role_id: user.role_id
    }));
    
    const usersResponse = {
      success: true,
      data: normalizedUsers
    };
    console.log('Réponse API Users:', JSON.stringify(usersResponse, null, 2));
    
    // Test 2: Création d'utilisateur (simuler POST login)
    console.log('\n--- Test Création Utilisateur ---');
    const testEmail = 'test' + Date.now() + '@example.com';
    const testPassword = 'password123';
    
    try {
      // Simuler createUser
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      const finalUsername = testEmail.split("@")[0];
      
      await connection.execute(
        "INSERT INTO users (email, password, username, role_id) VALUES (?, ?, ?, ?)",
        [testEmail, hashedPassword, finalUsername, "4"]
      );
      
      console.log('✅ Utilisateur créé avec succès');
      console.log('Email:', testEmail);
      console.log('Username:', finalUsername);
      console.log('Role ID: 4 (Membre Equipe)');
      
      // Vérifier l'insertion
      const [newUsers] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [testEmail]
      );
      
      if (newUsers.length > 0) {
        console.log('✅ Utilisateur bien inséré dans la base');
        console.log('ID:', newUsers[0].id);
        console.log('Données complètes:', newUsers[0]);
      }
      
    } catch (createError) {
      console.error('❌ Erreur lors de la création:', createError.message);
      console.error('Code:', createError.code);
    }
    
    // Test 3: API DAOs (GET)
    console.log('\n--- Test API DAOs (GET) ---');
    const [daos] = await connection.execute(
      `SELECT id, reference, objet, autorite, date_depot, statut, created_at, numero, description, chef_id, team_id, groupement, nom_partenaire FROM daos ORDER BY created_at DESC`
    );
    console.log('DAOs trouvés:', daos.length);
    
    const daosResponse = {
      success: true,
      data: daos
    };
    console.log('Réponse API DAOs:', JSON.stringify(daosResponse, null, 2));
    
    console.log('\n=== TEST TERMINÉ AVEC SUCCÈS ===');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connexion fermée');
    }
  }
}

testCompleteAPIs();
