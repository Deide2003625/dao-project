// Test des rôles dans la liste des utilisateurs
async function testRolesInUsers() {
  console.log('=== TEST RÔLES DANS UTILISATEURS ===');
  
  try {
    // Test GET pour vérifier que les rôles sont inclus
    console.log('\n--- Test GET /api/users avec rôles ---');
    const usersResponse = await fetch('http://localhost:3000/api/users');
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('✅ API Users fonctionne');
      console.log('Nombre d\'utilisateurs:', usersData.data?.length || 0);
      
      // Vérifier la structure des utilisateurs
      if (usersData.data && usersData.data.length > 0) {
        const firstUser = usersData.data[0];
        console.log('Structure du premier utilisateur:');
        console.log('- id:', firstUser.id);
        console.log('- username:', firstUser.username);
        console.log('- email:', firstUser.email);
        console.log('- role_id:', firstUser.role_id);
        console.log('- roleName:', firstUser.roleName);
        console.log('- roleLabel:', firstUser.roleLabel);
        
        // Afficher quelques utilisateurs avec leurs rôles
        console.log('\n--- Liste des utilisateurs avec rôles ---');
        usersData.data.slice(0, 5).forEach((user, index) => {
          console.log(`${index + 1}. ${user.username} (${user.email}) - ${user.roleLabel}`);
        });
      }
    } else {
      const errorText = await usersResponse.text();
      console.log('❌ Erreur API Users:', errorText);
    }
    
    // Test création pour vérifier que le rôle est inclus
    console.log('\n--- Test POST avec rôle ---');
    const testUser = {
      username: 'testrole' + Date.now(),
      email: 'testrole' + Date.now() + '@example.com',
      role_id: '2' // Admin
    };
    
    const createResponse = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Utilisateur créé avec rôle');
      console.log('Utilisateur:', {
        username: createData.user.username,
        email: createData.user.email,
        role_id: createData.user.role_id,
        roleName: createData.user.roleName,
        roleLabel: createData.user.roleLabel
      });
    } else {
      const errorText = await createResponse.text();
      console.log('❌ Erreur création:', errorText);
    }
    
    console.log('\n=== TEST RÔLES TERMINÉ ===');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testRolesInUsers();
