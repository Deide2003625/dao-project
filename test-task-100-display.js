// Test pour vérifier l'affichage de la tâche à 100%
async function testTask100Display() {
  console.log('=== TEST AFFICHAGE TÂCHE À 100% ===');
  
  try {
    // Récupérer les tâches depuis l'API
    const tasksResponse = await fetch('http://localhost:3000/api/tasks');
    
    if (tasksResponse.ok) {
      const tasksData = await tasksResponse.json();
      console.log('✅ API Tasks accessible');
      
      if (tasksData.success && tasksData.data) {
        console.log(`📊 Nombre total de tâches: ${tasksData.data.length}`);
        
        // Trouver la tâche à 100%
        const task100 = tasksData.data.find(t => t.progress === 100);
        
        if (task100) {
          console.log('\n🎯 TÂCHE À 100% TROUVÉE:');
          console.log('ID:', task100.id);
          console.log('Titre:', task100.titre);
          console.log('DAO:', task100.dao_id);
          console.log('Progression:', task100.progress + '%');
          console.log('Statut:', task100.statut);
          console.log('Assigné à:', task100.assigned_to || 'Non assigné');
          console.log('Date création:', task100.date_creation || 'Non définie');
          console.log('Date échéance:', task100.date_echeance || 'Non définie');
          console.log('Priorité:', task100.priorite || 'Non définie');
          
          // Vérifier le DAO associé
          const daosResponse = await fetch('http://localhost:3000/api/daos');
          if (daosResponse.ok) {
            const daosData = await daosResponse.json();
            const dao = daosData.data?.find(d => d.id === task100.dao_id);
            
            if (dao) {
              console.log('\n📋 DAO ASSOCIÉ:');
              console.log('Référence:', dao.reference || 'Sans référence');
              console.log('Objet:', dao.objet || 'Sans objet');
              console.log('Statut:', dao.statut || 'Non défini');
              console.log('Date dépôt:', dao.date_depot || 'Non définie');
            }
          }
          
          console.log('\n🎨 COULEUR DANS LE GRAPHIQUE:');
          console.log('La tâche à 100% devrait apparaître en VERT dans le graphique de progression');
          console.log('Elle devrait être comptée comme "Terminée" dans le graphique camembert');
          
        } else {
          console.log('\n❌ Aucune tâche à 100% trouvée dans l\'API');
        }
        
        // Afficher la distribution des progressions
        console.log('\n📈 DISTRIBUTION DES PROGRESSIONS:');
        const distribution = {};
        tasksData.data.forEach(task => {
          const progress = task.progress || 0;
          distribution[progress] = (distribution[progress] || 0) + 1;
        });
        
        Object.keys(distribution)
          .sort((a, b) => b - a)
          .forEach(progress => {
            console.log(`${progress}%: ${distribution[progress]} tâche(s)`);
          });
      }
    } else {
      console.log('❌ Erreur API Tasks:', tasksResponse.status);
    }
    
    console.log('\n💡 RECOMMANDATIONS:');
    console.log('1. La tâche à 100% devrait apparaître en vert dans le graphique');
    console.log('2. Elle devrait être comptée dans "Terminées" du camembert');
    console.log('3. La barre de progression devrait être complètement remplie');
    console.log('4. Vérifiez le dashboard Lecteur pour confirmer l\'affichage');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testTask100Display();
