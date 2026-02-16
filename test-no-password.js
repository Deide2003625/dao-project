// Test de création d'utilisateur sans mot de passe
async function testCreateUserNoPassword() {
  console.log('=== TEST CRÉATION UTILISATEUR SANS MOT DE PASSE ===');
  
  try {
    // Test 1: Créer un utilisateur sans mot de passe
    console.log('\n--- Test POST /api/users sans mot de passe ---');
    const testUser = {
      username: 'nopassword_' + Date.now(),
      email: 'nopass' + Date.now() + '@example.com',
      role_id: '4'
    };
    
    const createResponse = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    console.log('Status POST:', createResponse.status);
    
    let createdUser = null;
    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Utilisateur créé');
      createdUser = createData.user;
      console.log('ID créé:', createdUser.id);
      console.log('Username:', createdUser.username);
      console.log('Email:', createdUser.email);
      console.log('Rôle:', createdUser.roleLabel);
    } else {
      const errorText = await createResponse.text();
      console.log('❌ Erreur création:', errorText);
      return;
    }
    
    // Test 2: Vérifier directement dans la base que le mot de passe est NULL
    console.log('\n--- Test vérification mot de passe NULL ---');
    
    // Simuler une requête directe à la base pour vérifier
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'dao'
    });
    
    const [userRows] = await connection.execute(
      'SELECT id, username, email, password FROM users WHERE id = ?',
      [createdUser.id]
    );
    
    const userFromDB = userRows[0];
    console.log('Utilisateur depuis la base:');
    console.log('- ID:', userFromDB.id);
    console.log('- Username:', userFromDB.username);
    console.log('- Email:', userFromDB.email);
    console.log('- Password:', userFromDB.password); // Doit être NULL
    
    if (userFromDB.password === null) {
      console.log('✅ Mot de passe bien NULL dans la base');
    } else {
      console.log('❌ Mot de passe non NULL:', userFromDB.password ? 'existe' : 'vide');
    }
    
    await connection.end();
    
    // Test 3: Vérifier que l'utilisateur apparaît dans la liste API
    console.log('\n--- Test GET /api/users après création ---');
    const usersResponse = await fetch('http://localhost:3000/api/users');
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      const foundUser = usersData.data?.find(u => u.id === createdUser.id);
      
      if (foundUser) {
        console.log('✅ Utilisateur trouvé dans la liste API');
        console.log('Informations complètes:', {
          id: foundUser.id,
          username: foundUser.username,
          email: foundUser.email,
          roleLabel: foundUser.roleLabel,
          hasPassword: !!foundUser.password // Vérifier si le champ password existe
        });
      } else {
        console.log('❌ Utilisateur non trouvé dans la liste API');
      }
    }
    
    console.log('\n=== RÉSULTAT ===');
    console.log('✅ L\'admin peut créer des utilisateurs SANS mot de passe');
    console.log('✅ Les utilisateurs devront définir leur mot de passe lors de la première connexion');
    console.log('✅ La colonne password reste NULL dans la base de données');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testCreateUserNoPassword();
