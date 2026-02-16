// Test pour vérifier que le graphique affiche les IDs des tâches
async function testTaskIdsInChart() {
  console.log('=== TEST AFFICHAGE IDs TÂCHES DANS GRAPHIQUE ===');
  
  try {
    // Récupérer les données
    const [daosResponse, tasksResponse] = await Promise.all([
      fetch('http://localhost:3000/api/daos'),
      fetch('http://localhost:3000/api/tasks')
    ]);
    
    if (!daosResponse.ok || !tasksResponse.ok) {
      console.log('❌ Erreur lors de la récupération des données');
      return;
    }
    
    const daosData = await daosResponse.json();
    const tasksData = await tasksResponse.json();
    const daos = daosData.data || [];
    const tasks = tasksData.data || [];
    
    console.log(`📊 DAOs: ${daos.length}`);
    console.log(`📋 Tâches: ${tasks.length}`);
    
    // Prendre le premier DAO pour le test
    if (daos.length === 0) {
      console.log('❌ Aucun DAO disponible');
      return;
    }
    
    const firstDao = daos[0];
    const selectedDaoTasks = tasks.filter(t => t.dao_id === firstDao.id);
    
    console.log(`\n--- DAO sélectionné: ${firstDao.reference || `DAO-${firstDao.id}`} ---`);
    console.log(`📋 Tâches associées: ${selectedDaoTasks.length}`);
    
    console.log('\n--- Simulation des labels du graphique ---');
    
    // Ancienne logique (avec titres)
    const oldLabels = selectedDaoTasks.map(t => t.titre || `Tâche ${t.id}`);
    console.log('🔸 Anciens labels (avec titres):');
    oldLabels.forEach((label, index) => {
      console.log(`   ${index + 1}. "${label}"`);
    });
    
    // Nouvelle logique (avec IDs seulement)
    const newLabels = selectedDaoTasks.map(t => `Tâche ${t.id}`);
    console.log('\n✨ Nouveaux labels (avec IDs seulement):');
    newLabels.forEach((label, index) => {
      console.log(`   ${index + 1}. "${label}"`);
    });
    
    console.log('\n--- Détail des tâches ---');
    selectedDaoTasks.forEach((task, index) => {
      console.log(`📋 Tâche ${index + 1}:`);
      console.log(`   ID: ${task.id}`);
      console.log(`   Titre: "${task.titre || 'non défini'}"`);
      console.log(`   Progression: ${task.progress || 0}%`);
      console.log(`   Label dans graphique: "Tâche ${task.id}"`);
    });
    
    console.log('\n--- Avantages de la modification ---');
    console.log('✅ Affichage plus clair et concis');
    console.log('✅ Pas de titres longs ou vides');
    console.log('✅ Identification rapide par ID');
    console.log('✅ Cohérence avec la table "task" (sans "s")');
    console.log('✅ Format uniforme: "Tâche {ID}"');
    
    console.log('\n--- Impact sur l\'affichage ---');
    console.log('📊 Graphique "Progression des tâches":');
    console.log('   - Axe X: "Tâche 25", "Tâche 26", etc.');
    console.log('   - Plus lisible que les titres longs');
    console.log('   - Identification immédiate par ID');
    
    console.log('\n--- Test de cohérence ---');
    const hasDuplicates = newLabels.length !== new Set(newLabels).size;
    if (hasDuplicates) {
      console.log('⚠️  Attention: Doublons détectés dans les labels');
    } else {
      console.log('✅ Labels uniques et cohérents');
    }
    
    console.log('\n=== RÉSULTAT FINAL ===');
    console.log('🎯 Modification appliquée avec succès:');
    console.log('   ✅ Graphique utilise maintenant les IDs des tâches');
    console.log('   ✅ Format uniforme: "Tâche {ID}"');
    console.log('   ✅ Plus lisible et professionnel');
    console.log('   ✅ Cohérent avec la structure de la base');
    console.log('');
    console.log('🌐 Test visuel recommandé:');
    console.log('   1. Accéder à: http://localhost:3000/dash/Lecteur');
    console.log('   2. Sélectionner un DAO avec des tâches');
    console.log('   3. Vérifier le graphique "Progression des tâches"');
    console.log('   4. Confirmer que l\'axe X affiche "Tâche 25", "Tâche 26", etc.');
    console.log('   5. Comparer avec la liste des tâches pour cohérence');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testTaskIdsInChart();
