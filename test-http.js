// Test HTTP des APIs après corrections
async function testAPIsHTTP() {
  console.log('=== TEST HTTP DES APIS ===');
  
  try {
    // Test 1: API Users
    console.log('\n--- Test API Users ---');
    const usersResponse = await fetch('http://localhost:3000/api/users');
    console.log('Status Users:', usersResponse.status);
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('✅ Users API fonctionne');
      console.log('Nombre d\'utilisateurs:', usersData.data?.length || 0);
      console.log('Premier utilisateur:', usersData.data?.[0]);
    } else {
      const errorText = await usersResponse.text();
      console.log('❌ Users API erreur:', errorText);
    }
    
    // Test 2: API DAOs
    console.log('\n--- Test API DAOs ---');
    const daosResponse = await fetch('http://localhost:3000/api/daos');
    console.log('Status DAOs:', daosResponse.status);
    
    if (daosResponse.ok) {
      const daosData = await daosResponse.json();
      console.log('✅ DAOs API fonctionne');
      console.log('Nombre de DAOs:', daosData.data?.length || 0);
      console.log('Premier DAO:', daosData.data?.[0]);
    } else {
      const errorText = await daosResponse.text();
      console.log('❌ DAOs API erreur:', errorText);
    }
    
    // Test 3: Création d'utilisateur via login
    console.log('\n--- Test Création Utilisateur ---');
    const testEmail = 'test' + Date.now() + '@example.com';
    const testPassword = 'password123';
    
    const loginResponse = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        password_confirmation: testPassword,
        isNewUser: true
      })
    });
    
    console.log('Status Login:', loginResponse.status);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Création utilisateur fonctionne');
      console.log('Réponse:', loginData);
    } else {
      const errorText = await loginResponse.text();
      console.log('❌ Création utilisateur erreur:', errorText);
    }
    
    console.log('\n=== TEST TERMINÉ ===');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testAPIsHTTP();
