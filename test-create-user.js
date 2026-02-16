// Test de création d'utilisateur via API
async function testCreateUser() {
  console.log('=== TEST CRÉATION UTILISATEUR ===');
  
  try {
    // Test 1: Création d'un utilisateur
    console.log('\n--- Test POST /api/users ---');
    const testUser = {
      username: 'testuser' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      role_id: '4' // Membre Equipe
    };
    
    console.log('Données de test:', testUser);
    
    const createResponse = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    console.log('Status POST:', createResponse.status);
    
    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Création utilisateur réussie');
      console.log('Réponse:', createData);
    } else {
      const errorText = await createResponse.text();
      console.log('❌ Création utilisateur erreur:', errorText);
    }
    
    // Test 2: Vérifier que l'utilisateur apparaît dans la liste
    console.log('\n--- Test GET /api/users après création ---');
    const usersResponse = await fetch('http://localhost:3000/api/users');
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('✅ Liste utilisateurs mise à jour');
      console.log('Nombre total d\'utilisateurs:', usersData.data?.length || 0);
      
      // Chercher notre utilisateur créé
      const foundUser = usersData.data?.find((u) => u.email === testUser.email);
      if (foundUser) {
        console.log('✅ Utilisateur créé trouvé dans la liste:', foundUser);
      } else {
        console.log('❌ Utilisateur créé non trouvé dans la liste');
      }
    } else {
      const errorText = await usersResponse.text();
      console.log('❌ Erreur GET après création:', errorText);
    }
    
    // Test 3: Test avec email dupliqué
    console.log('\n--- Test email dupliqué ---');
    const duplicateResponse = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    console.log('Status duplication:', duplicateResponse.status);
    
    if (duplicateResponse.ok) {
      console.log('❌ Erreur: email dupliqué accepté');
    } else {
      const duplicateError = await duplicateResponse.json();
      console.log('✅ Email dupliqué rejeté:', duplicateError.error);
    }
    
    console.log('\n=== TEST CRÉATION TERMINÉ ===');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testCreateUser();
