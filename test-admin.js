// Test complet de la page admin
async function testAdminPage() {
  console.log('=== TEST PAGE ADMIN ===');
  
  try {
    // Test 1: API Roles
    console.log('\n--- Test API Roles ---');
    const rolesResponse = await fetch('http://localhost:3000/api/role');
    console.log('Status Roles:', rolesResponse.status);
    
    if (rolesResponse.ok) {
      const rolesData = await rolesResponse.json();
      console.log('✅ Roles API fonctionne');
      console.log('Rôles:', rolesData);
    } else {
      const errorText = await rolesResponse.text();
      console.log('❌ Roles API erreur:', errorText);
    }
    
    // Test 2: API Users (pour la page admin)
    console.log('\n--- Test API Users ---');
    const usersResponse = await fetch('http://localhost:3000/api/users');
    console.log('Status Users:', usersResponse.status);
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('✅ Users API fonctionne');
      console.log('Structure:', Object.keys(usersData));
      console.log('Nombre d\'utilisateurs:', usersData.data?.length || 0);
      console.log('Premier utilisateur:', usersData.data?.[0]);
    } else {
      const errorText = await usersResponse.text();
      console.log('❌ Users API erreur:', errorText);
    }
    
    // Test 3: API DAOs (pour la page admin)
    console.log('\n--- Test API DAOs ---');
    const daosResponse = await fetch('http://localhost:3000/api/daos');
    console.log('Status DAOs:', daosResponse.status);
    
    if (daosResponse.ok) {
      const daosData = await daosResponse.json();
      console.log('✅ DAOs API fonctionne');
      console.log('Structure:', Object.keys(daosData));
      console.log('Nombre de DAOs:', daosData.data?.length || 0);
      console.log('Premier DAO:', daosData.data?.[0]);
    } else {
      const errorText = await daosResponse.text();
      console.log('❌ DAOs API erreur:', errorText);
    }
    
    console.log('\n=== TEST ADMIN TERMINÉ ===');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testAdminPage();
