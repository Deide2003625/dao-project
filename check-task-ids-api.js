// Vérification des IDs des tâches via l'API existante
async function checkTaskIdsViaAPI() {
  console.log('=== VÉRIFICATION IDs TÂCHES VIA API ===');
  
  try {
    // Récupérer les tâches via l'API
    const tasksResponse = await fetch('http://localhost:3000/api/tasks');
    if (!tasksResponse.ok) {
      console.log('❌ Erreur API Tasks');
      return;
    }
    
    const tasksData = await tasksResponse.json();
    const tasks = tasksData.data || [];
    
    console.log(`📋 Nombre total de tâches: ${tasks.length}`);
    
    console.log('\n--- Détail des tâches ---');
    tasks.forEach((task, index) => {
      console.log(`🔍 Tâche ${index + 1}:`);
      console.log(`   ID: ${task.id}`);
      console.log(`   Titre: "${task.titre || 'vide'}"`);
      console.log(`   DAO ID: ${task.dao_id}`);
      console.log(`   Progression: ${task.progress || 0}%`);
      console.log(`   Statut: ${task.statut || 'vide'}`);
      console.log('');
    });
    
    // Analyse des IDs
    const ids = tasks.map(t => t.id).sort((a, b) => a - b);
    const minId = Math.min(...ids);
    const maxId = Math.max(...ids);
    const hasGaps = ids.some((id, index) => index > 0 && id !== ids[index - 1] + 1);
    
    console.log('--- Analyse des IDs ---');
    console.log(`📊 ID minimum: ${minId}`);
    console.log(`📊 ID maximum: ${maxId}`);
    console.log(`📊 IDs triés: [${ids.join(', ')}]`);
    console.log(`🔍 Commence par 1: ${minId === 1 ? '✅ Oui' : '❌ Non'}`);
    console.log(`🔍 Séquence continue: ${hasGaps ? '❌ Non (trous)' : '✅ Oui'}`);
    
    // Simulation des labels dans le graphique
    console.log('\n--- Labels dans le graphique actuel ---');
    const labels = tasks.map(t => `Tâche ${t.id}`);
    console.log('📊 Labels affichés:');
    labels.forEach((label, index) => {
      console.log(`   ${index + 1}. "${label}"`);
    });
    
    // Vérifier pour un DAO spécifique
    console.log('\n--- Tâches par DAO ---');
    const daoGroups = {};
    tasks.forEach(task => {
      const daoId = task.dao_id;
      if (!daoGroups[daoId]) {
        daoGroups[daoId] = [];
      }
      daoGroups[daoId].push(task);
    });
    
    Object.keys(daoGroups).forEach(daoId => {
      const daoTasks = daoGroups[daoId];
      console.log(`\n📋 DAO ${daoId} (${daoTasks.length} tâches):`);
      daoTasks.forEach(task => {
        console.log(`   - Tâche ${task.id}: "${task.titre || 'vide'}" (${task.progress || 0}%)`);
      });
    });
    
    console.log('\n=== RÉSULTAT FINAL ===');
    console.log('🎯 Vérification terminée:');
    console.log(`   ✅ IDs réels: [${ids.join(', ')}]`);
    console.log(`   ✅ ID minimum: ${minId}`);
    console.log(`   ✅ ID maximum: ${maxId}`);
    console.log(`   ✅ Format graphique: "Tâche {ID}"`);
    console.log(`   ✅ ${tasks.length} tâches trouvées`);
    
    if (minId !== 1) {
      console.log(`⚠️  Les IDs ne commencent pas par 1 mais par ${minId}`);
    }
    
    if (hasGaps) {
      console.log(`⚠️  Il y a des trous dans la séquence des IDs`);
    }
    
    console.log('\n🔧 Modification déjà appliquée:');
    console.log('   - Graphique utilise "Tâche {ID}"');
    console.log('   - IDs provenant de la table task');
    console.log('   - Format cohérent et lisible');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

checkTaskIdsViaAPI();
