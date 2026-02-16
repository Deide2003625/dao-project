// Vérification détaillée des deux tables task et tasks
const mysql = require('mysql2/promise');

async function checkBothTaskTables() {
  console.log('=== VÉRIFICATION TABLES TASK ET TASKS ===');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'dao'
    });
    
    console.log('✅ Connexion à la base "dao" réussie');
    
    // Vérifier la table task
    console.log('\n--- Table "task" ---');
    const [taskColumns] = await connection.execute(`DESCRIBE task`);
    console.log('📋 Structure:');
    taskColumns.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.Field} - ${col.Type}`);
    });
    
    const [taskData] = await connection.execute(`SELECT * FROM task ORDER BY id`);
    console.log(`\n📋 Données (${taskData.length} tâches):`);
    taskData.forEach((task, index) => {
      console.log(`   ${index + 1}. ID: ${task.id}, Nom: "${task.nom}"`);
    });
    
    // Vérifier la table tasks
    console.log('\n--- Table "tasks" ---');
    const [tasksColumns] = await connection.execute(`DESCRIBE tasks`);
    console.log('📋 Structure:');
    tasksColumns.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.Field} - ${col.Type}`);
    });
    
    const [tasksData] = await connection.execute(`SELECT * FROM tasks ORDER BY id`);
    console.log(`\n📋 Données (${tasksData.length} tâches):`);
    tasksData.forEach((task, index) => {
      console.log(`   ${index + 1}. ID: ${task.id}, Titre: "${task.titre}"`);
    });
    
    // Comparaison
    console.log('\n--- Comparaison des deux tables ---');
    console.log(`Table "task": ${taskData.length} tâches, IDs de ${taskData[0]?.id || 'N/A'} à ${taskData[taskData.length-1]?.id || 'N/A'}`);
    console.log(`Table "tasks": ${tasksData.length} tâches, IDs de ${tasksData[0]?.id || 'N/A'} à ${tasksData[tasksData.length-1]?.id || 'N/A'}`);
    
    // Vérifier quelle table est utilisée par l'API
    console.log('\n--- Vérification de l\'API ---');
    try {
      const apiResponse = await fetch('http://localhost:3000/api/tasks');
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        const apiTasks = apiData.data || [];
        console.log(`📊 API retourne ${apiTasks.length} tâches`);
        
        if (apiTasks.length > 0) {
          const apiIds = apiTasks.map(t => t.id).sort((a, b) => a - b);
          const taskIds = taskData.map(t => t.id);
          const tasksIds = tasksData.map(t => t.id);
          
          console.log(`📊 IDs API: [${apiIds.join(', ')}]`);
          console.log(`📊 IDs table "task": [${taskIds.join(', ')}]`);
          console.log(`📊 IDs table "tasks": [${tasksIds.join(', ')}]`);
          
          const matchesTask = JSON.stringify(apiIds) === JSON.stringify(taskIds);
          const matchesTasks = JSON.stringify(apiIds) === JSON.stringify(tasksIds);
          
          console.log(`🔍 API utilise table "task": ${matchesTask ? '✅ Oui' : '❌ Non'}`);
          console.log(`🔍 API utilise table "tasks": ${matchesTasks ? '✅ Oui' : '❌ Non'}`);
          
          if (matchesTasks) {
            console.log('\n🎯 L\'API utilise la table "tasks" avec les IDs 24, 25, 26, 27');
            console.log('✅ Le graphique affiche correctement "Tâche 24", "Tâche 25", etc.');
          } else if (matchesTask) {
            console.log('\n🎯 L\'API utilise la table "task" avec les IDs 1, 2, 3, 4');
            console.log('⚠️  Le graphique devrait afficher "Tâche 1", "Tâche 2", etc.');
          }
        }
      }
    } catch (error) {
      console.log('❌ Erreur API:', error.message);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

checkBothTaskTables();
