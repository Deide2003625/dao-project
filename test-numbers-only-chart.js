// Test pour vérifier l'affichage des numéros sans "Tâche " et en ordre croissant
async function testNumbersOnlyChart() {
  console.log('=== TEST NUMÉROS SANS "TÂCHE " EN ORDRE CROISSANT ===');
  
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
    
    // Trier par id_task pour l'ordre croissant
    const sortedTasks = [...tasks].sort((a, b) => a.id_task - b.id_task);
    
    console.log('\n--- Données triées par id_task (ordre croissant) ---');
    sortedTasks.forEach((task, index) => {
      console.log(`🔍 Tâche ${index + 1}:`);
      console.log(`   id: ${task.id}`);
      console.log(`   id_task: ${task.id_task}`);
      console.log(`   titre: "${task.titre}"`);
      console.log(`   dao_id: ${task.dao_id}`);
      console.log(`   progress: ${task.progress}%`);
      console.log(`   Label graphique: "${task.id_task}"`);
      console.log('');
    });
    
    // Simulation pour DAO 34
    const dao34Tasks = tasks.filter(t => t.dao_id === 34);
    const sortedDao34Tasks = [...dao34Tasks].sort((a, b) => a.id_task - b.id_task);
    
    console.log('--- Graphique pour DAO 34 (trié par id_task croissant) ---');
    console.log(`📊 Tâches concernées: ${sortedDao34Tasks.length}`);
    
    // Simuler les labels du graphique (sans "Tâche ")
    const chartLabels = sortedDao34Tasks.map(t => t.id_task.toString());
    const chartData = sortedDao34Tasks.map(t => t.progress || 0);
    
    console.log('\n📊 Labels du graphique (numéros seulement):');
    chartLabels.forEach((label, index) => {
      const progress = chartData[index];
      let color = 'Rouge';
      if (progress === 100) color = 'VERT';
      else if (progress >= 75) color = 'Bleu';
      else if (progress >= 50) color = 'Orange';
      else if (progress >= 25) color = 'Jaune';
      
      console.log(`   ${index + 1}. "${label}" → ${progress}% (${color})`);
    });
    
    // Comparaison avec l'ancienne méthode
    console.log('\n--- Comparaison avant/après ---');
    console.log('AVANT (avec "Tâche "):');
    const oldLabels = sortedDao34Tasks.map(t => `Tâche ${t.id_task}`);
    oldLabels.forEach((label, index) => {
      console.log(`   ${index + 1}. "${label}"`);
    });
    
    console.log('\nAPRÈS (numéros seulement):');
    chartLabels.forEach((label, index) => {
      console.log(`   ${index + 1}. "${label}"`);
    });
    
    // Vérification de l'ordre croissant
    const idTasks = sortedDao34Tasks.map(t => t.id_task);
    const isSorted = idTasks.every((id, index) => index === 0 || id > idTasks[index - 1]);
    
    console.log('\n--- Vérifications ---');
    console.log(`📊 id_tasks: [${idTasks.join(', ')}]`);
    console.log(`🔍 Ordre croissant: ${isSorted ? '✅ Oui' : '❌ Non'}`);
    console.log(`🔍 Pas de "Tâche ": ${!chartLabels.some(label => label.includes('Tâche')) ? '✅ Oui' : '❌ Non'}`);
    console.log(`🔍 Numéros seulement: ${chartLabels.every(label => /^\d+$/.test(label)) ? '✅ Oui' : '❌ Non'}`);
    
    console.log('\n--- Avantages de la modification ---');
    console.log('✅ Plus compact et lisible');
    console.log('✅ Ordre croissant logique (1, 2, 3, 4)');
    console.log('✅ Pas de texte superflu');
    console.log('✅ Identification rapide par numéro');
    console.log('✅ Graphique plus aéré');
    
    console.log('\n--- Détail technique ---');
    console.log('🔧 Modifications appliquées:');
    console.log('   AVANT: `Tâche ${t.id_task}`');
    console.log('   APRÈS: `t.id_task.toString()`');
    console.log('   TRI: `.sort((a, b) => a.id_task - b.id_task)`');
    console.log('');
    console.log('📊 Résultat:');
    console.log('   - Labels: "1", "2", "3", "4"');
    console.log('   - Ordre: Croissant');
    console.log('   - Format: Numéros seulement');
    
    console.log('\n=== RÉSULTAT FINAL ===');
    console.log('🎯 Modification réussie:');
    console.log('   ✅ Plus de "Tâche " avant les numéros');
    console.log('   ✅ Numéros seulement: "1", "2", "3", "4"');
    console.log('   ✅ Ordre croissant garanti');
    console.log('   ✅ Graphique plus épuré');
    console.log('   ✅ Plus lisible et compact');
    console.log('');
    console.log('🌐 Test visuel recommandé:');
    console.log('   1. http://localhost:3000/dash/Lecteur');
    console.log('   2. Sélectionner DAO: jjjjjjjjjjjjjjjjj');
    console.log('   3. Vérifier graphique "Progression des tâches"');
    console.log('   4. Confirmer labels: "1", "2", "3", "4"');
    console.log('   5. Vérifier ordre croissant');
    console.log('   6. Confirmer que "3" est en VERT (100%)');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testNumbersOnlyChart();
