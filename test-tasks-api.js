// Test de l'API tasks avec fetch
async function testTasksApi() {
  console.log('=== TEST API TASKS ===');
  
  try {
    console.log('\n--- Test API tasks pour DAO 34 ---');
    
    const response = await fetch('http://localhost:3000/api/tasks?daoId=34', { 
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status}`);
    
    const json = await response.json();
    console.log(`Response:`, json);
    
    if (response.ok && json.success && json.data) {
      console.log(`✅ ${json.data.length} tâches trouvées pour le DAO 34`);
      
      json.data.forEach((task, index) => {
        console.log(`  ${index + 1}. ID=${task.id}, Titre=${task.titre}, Progression=${task.progress}%, Assigné à=${task.assigned_username || 'N/A'}`);
      });
      
      // Adapter pour le format attendu par la page
      const adaptedTasks = json.data.map(task => ({
        id: task.id,
        name: task.titre || `Tâche ${task.id}`,
        progress: task.progress || 0,
        comment: task.description || "À faire",
        assigned_to: task.assigned_username || "Non assigné"
      }));
      
      console.log('\n✅ Tâches adaptées pour la page:');
      adaptedTasks.forEach((task, index) => {
        console.log(`  ${index + 1}. ID=${task.id}, Nom=${task.name}, Progression=${task.progress}%, Assigné à=${task.assigned_to}`);
      });
      
    } else {
      console.log('❌ Erreur API tasks:');
      console.log(`Status: ${response.status}`);
      console.log(`Response:`, json);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testTasksApi();
