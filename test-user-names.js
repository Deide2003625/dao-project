// Test pour vérifier que les noms d'utilisateurs sont bien chargés
async function testUserNames() {
  console.log('=== TEST NOMS UTILISATEURS ===');
  
  try {
    console.log('\n--- Test API tasks pour DAO 34 avec noms ---');
    
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
      
      console.log('\n📋 Détails des tâches avec noms:');
      json.data.forEach((task, index) => {
        console.log(`  ${index + 1}. ID=${task.id}`);
        console.log(`     Titre: ${task.titre}`);
        console.log(`     Progression: ${task.progress}%`);
        console.log(`     ID assigné: ${task.assigned_to}`);
        console.log(`     Nom assigné: ${task.assigned_username}`);
        console.log(`     Statut: ${task.statut}`);
        console.log('');
      });
      
      // Vérifier si les noms sont bien présents
      const tasksWithNames = json.data.filter(task => task.assigned_username);
      const tasksWithoutNames = json.data.filter(task => !task.assigned_username);
      
      console.log(`📊 Statistiques:`);
      console.log(`  - Tâches avec noms: ${tasksWithNames.length}`);
      console.log(`  - Tâches sans noms: ${tasksWithoutNames.length}`);
      
      if (tasksWithoutNames.length > 0) {
        console.log('\n❌ Tâches sans noms:');
        tasksWithoutNames.forEach(task => {
          console.log(`  - ID=${task.id}, assigned_to=${task.assigned_to}`);
        });
      }
      
    } else {
      console.log('❌ Erreur API tasks:');
      console.log(`Status: ${response.status}`);
      console.log(`Response:`, json);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testUserNames();
