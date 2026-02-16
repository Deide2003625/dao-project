// Test complet CRUD pour les utilisateurs
async function testCRUDUsers() {
  console.log('=== TEST CRUD UTILISATEURS ===');
  
  try {
    // Test 1: POST - Création
    console.log('\n--- Test POST /api/users ---');
    const testUser = {
      username: 'testcrud' + Date.now(),
      email: 'testcrud' + Date.now() + '@example.com',
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
    } else {
      const errorText = await createResponse.text();
      console.log('❌ Erreur création:', errorText);
      return;
    }
    
    // Test 2: PUT - Mise à jour
    console.log('\n--- Test PUT /api/users ---');
    const updatedUser = {
      username: createdUser.username + '_updated',
      email: createdUser.email,
      role_id: '3' // Changer de rôle
    };
    
    const updateResponse = await fetch('http://localhost:3000/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser)
    });
    
    console.log('Status PUT:', updateResponse.status);
    
    if (updateResponse.ok) {
      const updateData = await updateResponse.json();
      console.log('✅ Utilisateur mis à jour');
      console.log('Nouveau username:', updateData.user.username);
      console.log('Nouveau role_id:', updateData.user.role_id);
    } else {
      const errorText = await updateResponse.text();
      console.log('❌ Erreur mise à jour:', errorText);
    }
    
    // Test 3: DELETE - Suppression
    console.log('\n--- Test DELETE /api/users/{id} ---');
    const deleteResponse = await fetch(`http://localhost:3000/api/users/${createdUser.id}`, {
      method: 'DELETE'
    });
    
    console.log('Status DELETE:', deleteResponse.status);
    
    if (deleteResponse.ok) {
      const deleteData = await deleteResponse.json();
      console.log('✅ Utilisateur supprimé');
      console.log('Message:', deleteData.message);
    } else {
      const errorText = await deleteResponse.text();
      console.log('❌ Erreur suppression:', errorText);
    }
    
    // Test 4: Vérifier que l'utilisateur n'existe plus
    console.log('\n--- Test GET après suppression ---');
    const usersResponse = await fetch('http://localhost:3000/api/users');
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      const foundUser = usersData.data?.find(u => u.id === createdUser.id);
      
      if (!foundUser) {
        console.log('✅ Utilisateur bien supprimé de la liste');
      } else {
        console.log('❌ Utilisateur encore présent dans la liste');
      }
    }
    
    console.log('\n=== TEST CRUD TERMINÉ ===');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testCRUDUsers();
