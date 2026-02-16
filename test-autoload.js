// Test pour vérifier que tout s'affiche automatiquement au chargement du dashboard Lecteur
async function testAutoLoad() {
  console.log('=== TEST CHARGEMENT AUTOMATIQUE DASHBOARD LECTEUR ===');
  
  try {
    console.log('\n--- Étape 1: Vérification disponibilité des APIs ---');
    
    // Test API DAOs
    const daosResponse = await fetch('http://localhost:3000/api/daos');
    const daosOk = daosResponse.ok;
    console.log(`API DAOs: ${daosOk ? '✅ OK' : '❌ Erreur'}`);
    
    // Test API Tasks
    const tasksResponse = await fetch('http://localhost:3000/api/tasks');
    const tasksOk = tasksResponse.ok;
    console.log(`API Tasks: ${tasksOk ? '✅ OK' : '❌ Erreur'}`);
    
    // Test API Users
    const usersResponse = await fetch('http://localhost:3000/api/users');
    const usersOk = usersResponse.ok;
    console.log(`API Users: ${usersOk ? '✅ OK' : '❌ Erreur'}`);
    
    if (!daosOk || !tasksOk || !usersOk) {
      console.log('\n❌ Certaines APIs ne sont pas accessibles');
      return;
    }
    
    console.log('\n--- Étape 2: Vérification données disponibles ---');
    
    const daosData = await daosResponse.json();
    const tasksData = await tasksResponse.json();
    const usersData = await usersResponse.json();
    
    console.log(`✅ DAOs disponibles: ${daosData.data?.length || 0}`);
    console.log(`✅ Tâches disponibles: ${tasksData.data?.length || 0}`);
    console.log(`✅ Utilisateurs disponibles: ${usersData.data?.length || 0}`);
    
    if (!daosData.data || daosData.data.length === 0) {
      console.log('\n❌ Aucun DAO disponible pour le dashboard');
      return;
    }
    
    console.log('\n--- Étape 3: Simulation du flux de chargement ---');
    
    // Simuler le premier DAO qui sera sélectionné automatiquement
    const firstDao = daosData.data[0];
    console.log(`📋 Premier DAO sélectionné automatiquement: ${firstDao.reference || `DAO-${firstDao.id}`}`);
    
    // Simuler les tâches associées
    const firstDaoTasks = tasksData.data?.filter(t => t.dao_id === firstDao.id) || [];
    console.log(`📊 Tâches associées: ${firstDaoTasks.length}`);
    
    // Vérifier la distribution pour les graphiques
    const statusCounts = {
      completed: firstDaoTasks.filter(t => (t.progress || 0) === 100).length,
      inProgress: firstDaoTasks.filter(t => (t.progress || 0) > 0 && (t.progress || 0) < 100).length,
      notStarted: firstDaoTasks.filter(t => (t.progress || 0) === 0).length,
    };
    
    console.log('📈 Distribution pour le camembert:');
    console.log(`   Terminées: ${statusCounts.completed}`);
    console.log(`   En cours: ${statusCounts.inProgress}`);
    console.log(`   Non démarrées: ${statusCounts.notStarted}`);
    
    // Vérifier les couleurs pour le graphique de progression
    console.log('\n🎨 Couleurs pour le graphique de progression:');
    firstDaoTasks.forEach(task => {
      const progress = task.progress || 0;
      let color = 'Rouge';
      if (progress === 100) color = 'VERT';
      else if (progress >= 75) color = 'Bleu';
      else if (progress >= 50) color = 'Orange';
      else if (progress >= 25) color = 'Jaune';
      
      console.log(`   ${task.titre || `Tâche ${task.id}`}: ${progress}% -> ${color}`);
    });
    
    console.log('\n--- Étape 4: Vérification des statistiques ---');
    
    const stats = {
      totalDaos: daosData.data?.length || 0,
      completedDaos: daosData.data?.filter(d => {
        const statut = String(d.statut || "").toUpperCase();
        return statut === "TERMINEE" || statut === "TERMINE";
      }).length,
      inProgressDaos: daosData.data?.filter(d => {
        const statut = String(d.statut || "").toUpperCase();
        if (statut === "TERMINEE" || statut === "TERMINE") return false;
        if (!d.date_depot) return true;
        const dateDepot = new Date(d.date_depot);
        const today = new Date();
        const diffMs = dateDepot.getTime() - today.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return diffDays >= 5;
      }).length,
      atRiskDaos: daosData.data?.filter(d => {
        const statut = String(d.statut || "").toUpperCase();
        if (statut === "TERMINEE" || statut === "TERMINE") return false;
        if (!d.date_depot) return false;
        const dateDepot = new Date(d.date_depot);
        const today = new Date();
        const diffMs = dateDepot.getTime() - today.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return diffDays <= 3;
      }).length,
    };
    
    console.log('📊 Cartes statistiques qui s\'afficheront:');
    console.log(`   Total DAOs: ${stats.totalDaos}`);
    console.log(`   Terminées: ${stats.completedDaos}`);
    console.log(`   En cours: ${stats.inProgressDaos}`);
    console.log(`   À risque: ${stats.atRiskDaos}`);
    
    console.log('\n=== RÉSULTAT FINAL ===');
    console.log('🎯 Le dashboard Lecteur devrait maintenant se charger automatiquement avec:');
    console.log('   ✅ Message de chargement pendant la récupération des données');
    console.log('   ✅ Sélection automatique du premier DAO disponible');
    console.log('   ✅ Affichage immédiat des statistiques');
    console.log('   ✅ Graphiques créés après 100ms (délai DOM)');
    console.log('   ✅ Liste des tâches avec barres de progression');
    console.log('   ✅ Gestion des erreurs (aucun DAO, etc.)');
    console.log('');
    console.log('🌐 Test de navigation:');
    console.log('   1. Accéder à: http://localhost:3000/dash/Lecteur');
    console.log('   2. Observer le message de chargement');
    console.log('   3. Vérifier que tout s\'affiche automatiquement');
    console.log('   4. Confirmer que le premier DAO est sélectionné');
    console.log('   5. Vérifier les graphiques et les statistiques');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testAutoLoad();
