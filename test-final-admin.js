// Test final de la page admin avec rôles
async function testFinalAdminPage() {
  console.log('=== TEST FINAL PAGE ADMIN ===');
  
  try {
    // Test 1: Vérifier que les rôles sont disponibles
    console.log('\n--- Test API Roles ---');
    const rolesResponse = await fetch('http://localhost:3000/api/role');
    
    if (rolesResponse.ok) {
      const rolesData = await rolesResponse.json();
      console.log('✅ Rôles disponibles:', rolesData.length);
      rolesData.forEach(role => {
        console.log(`- ${role.id}: ${role.label} (${role.name})`);
      });
    }
    
    // Test 2: Vérifier que les utilisateurs ont leurs rôles
    console.log('\n--- Test API Users avec rôles ---');
    const usersResponse = await fetch('http://localhost:3000/api/users');
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('✅ Utilisateurs avec rôles:', usersData.data?.length || 0);
      
      // Compter par rôle
      const roleCounts = {};
      usersData.data?.forEach(user => {
        roleCounts[user.roleLabel] = (roleCounts[user.roleLabel] || 0) + 1;
      });
      
      console.log('Répartition par rôle:');
      Object.entries(roleCounts).forEach(([role, count]) => {
        console.log(`- ${role}: ${count} utilisateur(s)`);
      });
      
      // Vérifier que tous les utilisateurs ont roleName et roleLabel
      const usersWithoutRoles = usersData.data?.filter(user => !user.roleName || !user.roleLabel);
      if (usersWithoutRoles.length === 0) {
        console.log('✅ Tous les utilisateurs ont des informations de rôle');
      } else {
        console.log('❌ Certains utilisateurs n\'ont pas de rôle:', usersWithoutRoles.length);
      }
    }
    
    // Test 3: Créer un utilisateur de chaque rôle
    console.log('\n--- Test création utilisateurs par rôle ---');
    const roles = [
      { id: '1', name: 'Directeur Général' },
      { id: '2', name: 'Administrateur' },
      { id: '3', name: 'Chef de Projet' },
      { id: '4', name: 'Membre d\'Équipe' },
      { id: '5', name: 'Lecteur' }
    ];
    
    for (const role of roles) {
      const testUser = {
        username: `test_${role.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
        email: `test_${role.id}_${Date.now()}@example.com`,
        role_id: role.id
      };
      
      const createResponse = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testUser)
      });
      
      if (createResponse.ok) {
        const createData = await createResponse.json();
        console.log(`✅ ${role.name} créé: ${createData.user.roleLabel}`);
      } else {
        console.log(`❌ Erreur création ${role.name}:`, await createResponse.text());
      }
    }
    
    console.log('\n=== TEST FINAL TERMINÉ ===');
    console.log('📋 La page admin devrait maintenant afficher:');
    console.log('   - La liste complète des utilisateurs');
    console.log('   - Les rôles avec des badges colorés');
    console.log('   - Les actions de modification et suppression');
    console.log('   - Le formulaire de création avec sélection de rôle');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testFinalAdminPage();
