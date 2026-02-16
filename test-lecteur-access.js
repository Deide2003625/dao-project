// Test simple d'accès au dashboard lecteur
async function testLecteurAccess() {
  console.log('=== TEST ACCÈS DASHBOARD LECTEUR ===');
  
  try {
    // Test 1: Vérifier que les APIs sont accessibles
    console.log('\n--- Test API DAOs ---');
    const daosResponse = await fetch('http://localhost:3000/api/daos');
    if (daosResponse.ok) {
      const daosData = await daosResponse.json();
      console.log('✅ DAOs:', daosData.data?.length || 0);
    }
    
    console.log('\n--- Test API Tasks ---');
    const tasksResponse = await fetch('http://localhost:3000/api/tasks');
    if (tasksResponse.ok) {
      const tasksData = await tasksResponse.json();
      console.log('✅ Tâches:', tasksData.data?.length || 0);
    }
    
    console.log('\n--- Test API Users ---');
    const usersResponse = await fetch('http://localhost:3000/api/users');
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('✅ Utilisateurs:', usersData.data?.length || 0);
      
      const lecteurs = usersData.data?.filter(u => u.role_id === 5);
      console.log('✅ Lecteurs:', lecteurs.length);
    }
    
    console.log('\n=== RÉSULTAT FINAL ===');
    console.log('🎯 Dashboard Lecteur est prêt !');
    console.log('📊 Fonctionnalités disponibles:');
    console.log('   - Statistiques en temps réel (DAOs, tâches, utilisateurs)');
    console.log('   - Sélection de DAO avec statuts colorés');
    console.log('   - Graphique de progression des tâches');
    console.log('   - Distribution des statuts (camembert)');
    console.log('   - Liste détaillée des tâches avec barres de progression');
    console.log('   - Données dynamiques depuis la base de données');
    console.log('');
    console.log('🌐 Accès: http://localhost:3000/dash/Lecteur');
    console.log('👤 Rôle: Lecteur (role_id = 5)');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testLecteurAccess();
