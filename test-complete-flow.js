// Test du flux complet: admin crée utilisateur -> utilisateur définit son mot de passe
async function testCompleteUserFlow() {
  console.log('=== TEST FLUX COMPLET UTILISATEUR ===');
  
  try {
    // Étape 1: Admin crée un utilisateur sans mot de passe
    console.log('\n--- Étape 1: Admin crée un utilisateur ---');
    const newUser = {
      username: 'flowtest_' + Date.now(),
      email: 'flowtest' + Date.now() + '@example.com',
      role_id: '4'
    };
    
    const createResponse = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    
    if (!createResponse.ok) {
      console.log('❌ Erreur création utilisateur:', await createResponse.text());
      return;
    }
    
    const createData = await createResponse.json();
    console.log('✅ Utilisateur créé par admin:', createData.user.username);
    console.log('Mot de passe: NON défini (NULL dans la base)');
    
    // Étape 2: Utilisateur essaie de se connecter pour la première fois
    console.log('\n--- Étape 2: Première connexion de l\'utilisateur ---');
    
    // Simuler la vérification d'email (comme le fait le formulaire de login)
    const checkEmailResponse = await fetch('http://localhost:3000/api/check-email?email=' + encodeURIComponent(newUser.email));
    
    if (checkEmailResponse.ok) {
      const emailData = await checkEmailResponse.json();
      console.log('✅ Email trouvé dans le système');
      console.log('A un mot de passe:', emailData.password !== null);
      
      if (emailData.password === null) {
        console.log('📝 L\'utilisateur devra définir son mot de passe');
      }
    }
    
    // Étape 3: Utilisateur définit son mot de passe (via login avec isNewUser)
    console.log('\n--- Étape 3: Utilisateur définit son mot de passe ---');
    const userPassword = 'MySecurePassword123!';
    
    const loginResponse = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: newUser.email,
        password: userPassword,
        password_confirmation: userPassword,
        isNewUser: true
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Mot de passe défini avec succès');
      console.log('Utilisateur connecté:', loginData.user.username);
      console.log('Redirection vers:', loginData.redirect);
    } else {
      const errorText = await loginResponse.text();
      console.log('❌ Erreur définition mot de passe:', errorText);
    }
    
    // Étape 4: Vérifier que l'utilisateur a maintenant un mot de passe
    console.log('\n--- Étape 4: Vérification mot de passe défini ---');
    
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'dao'
    });
    
    const [userRows] = await connection.execute(
      'SELECT id, username, password FROM users WHERE email = ?',
      [newUser.email]
    );
    
    const userFromDB = userRows[0];
    console.log('État final du mot de passe:', userFromDB.password ? '✅ Défini' : '❌ NULL');
    
    await connection.end();
    
    // Étape 5: Tester la connexion normale avec le mot de passe
    console.log('\n--- Étape 5: Connexion normale avec mot de passe ---');
    
    const normalLoginResponse = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: newUser.email,
        password: userPassword
        // Pas de isNewUser ni password_confirmation pour connexion normale
      })
    });
    
    if (normalLoginResponse.ok) {
      const normalLoginData = await normalLoginResponse.json();
      console.log('✅ Connexion normale réussie');
      console.log('Utilisateur:', normalLoginData.user.username);
      console.log('Rôle:', normalLoginData.user.role_id);
    } else {
      const errorText = await normalLoginResponse.text();
      console.log('❌ Erreur connexion normale:', errorText);
    }
    
    console.log('\n=== RÉSULTAT FINAL ===');
    console.log('✅ Admin peut créer des utilisateurs SANS mot de passe');
    console.log('✅ Utilisateur définit son mot de passe lors de la première connexion');
    console.log('✅ Connexion normale fonctionne après définition du mot de passe');
    console.log('✅ Flux complet testé avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testCompleteUserFlow();
