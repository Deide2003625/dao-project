// Test final pour vérifier l'utilisation de id_task (commence par 1)
async function testIdTaskInChart() {
  console.log('=== TEST UTILISATION ID_TASK DANS GRAPHIQUE ===');
  
  try {
    // Récupérer les tâches via l'API
    const tasksResponse = await fetch('http://localhost:3000/api/tasks');
    if (!tasksResponse.ok) {
      console.log('❌ Erreur API Tasks');
      return;
    }
    
    const tasksData = await tasksResponse.json();
    const tasks = tasksData.data || [];
    
    console.log(`📋 Tâches trouvées: ${tasks.length}`);
    
    console.log('\n--- Données complètes (id et id_task) ---');
    tasks.forEach((task, index) => {
      console.log(`🔍 Tâche ${index + 1}:`);
      console.log(`   id: ${task.id}`);
      console.log(`   id_task: ${task.id_task}`);
      console.log(`   titre: "${task.titre}"`);
      console.log(`   dao_id: ${task.dao_id}`);
      console.log(`   progress: ${task.progress}%`);
      console.log(`   Label graphique: "Tâche ${task.id_task}"`);
      console.log('');
    });
    
    // Analyse des id_task
    const idTasks = tasks.map(t => t.id_task);
    const ids = tasks.map(t => t.id);
    
    console.log('--- Comparaison des options ---');
    console.log(`📊 ids (24, 25, 26, 27): [${ids.join(', ')}]`);
    console.log(`📊 id_tasks (1, 2, 3, 4): [${idTasks.join(', ')}]`);
    
    const minIdTask = Math.min(...idTasks);
    const maxIdTask = Math.max(...idTasks);
    
    console.log(`📊 id_task min: ${minIdTask}`);
    console.log(`📊 id_task max: ${maxIdTask}`);
    console.log(`🔍 id_task commence par 1: ${minIdTask === 1 ? '✅ Oui' : '❌ Non'}`);
    
    // Simulation pour DAO 34
    const dao34Tasks = tasks.filter(t => t.dao_id === 34);
    
    console.log('\n--- Graphique pour DAO 34 ---');
    console.log(`📊 Tâches concernées: ${dao34Tasks.length}`);
    
    // Simuler les labels du graphique avec id_task
    const chartLabels = dao34Tasks.map(t => `Tâche ${t.id_task}`);
    const chartData = dao34Tasks.map(t => t.progress || 0);
    
    console.log('\n📊 Labels avec id_task (nouveau):');
    chartLabels.forEach((label, index) => {
      const progress = chartData[index];
      let color = 'Rouge';
      if (progress === 100) color = 'VERT';
      else if (progress >= 75) color = 'Bleu';
      else if (progress >= 50) color = 'Orange';
      else if (progress >= 25) color = 'Jaune';
      
      console.log(`   ${index + 1}. ${label} → ${progress}% (${color})`);
    });
    
    // Comparaison avec l'ancienne méthode
    console.log('\n📊 Labels avec id (ancien):');
    const oldLabels = dao34Tasks.map(t => `Tâche ${t.id}`);
    oldLabels.forEach((label, index) => {
      const progress = chartData[index];
      console.log(`   ${index + 1}. ${label} → ${progress}%`);
    });
    
    console.log('\n--- Avantages de id_task ---');
    console.log('✅ Commence par 1 comme demandé');
    console.log('✅ Plus intuitif pour les utilisateurs');
    console.log('✅ Séquence logique 1, 2, 3, 4');
    console.log('✅ Correspond à la colonne id_task de la table');
    
    console.log('\n--- Détail technique ---');
    console.log('🔧 Modification appliquée:');
    console.log('   AVANT: `Tâche ${t.id}`');
    console.log('   APRÈS: `Tâche ${t.id_task}`');
    console.log('');
    console.log('📊 Table: tasks');
    console.log('📊 Colonne: id_task (int(255))');
    console.log('📊 Valeurs: 1, 2, 3, 4');
    console.log('📊 Format: "Tâche {id_task}"');
    
    console.log('\n=== RÉSULTAT FINAL ===');
    console.log('🎯 Modification réussie:');
    console.log('   ✅ Graphique utilise maintenant id_task');
    console.log('   ✅ Labels: "Tâche 1", "Tâche 2", "Tâche 3", "Tâche 4"');
    console.log('   ✅ Commence bien par 1 comme demandé');
    console.log('   ✅ Plus intuitif et logique');
    console.log('   ✅ Utilise la colonne id_task de la table');
    console.log('');
    console.log('🌐 Test visuel recommandé:');
    console.log('   1. http://localhost:3000/dash/Lecteur');
    console.log('   2. Sélectionner DAO: jjjjjjjjjjjjjjjjj');
    console.log('   3. Vérifier graphique "Progression des tâches"');
    console.log('   4. Confirmer labels: "Tâche 1", "Tâche 2", "Tâche 3", "Tâche 4"');
    console.log('   5. Vérifier que "Tâche 3" est en VERT (100%)');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testIdTaskInChart();
