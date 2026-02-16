// Vérification directe des IDs des tâches dans la base de données
const mysql = require('mysql2/promise');

async function checkTaskIdsInDatabase() {
  console.log('=== VÉRIFICATION IDs TÂCHES DANS LA BASE ===');
  
  try {
    // Connexion à la base de données
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'dao_project'
    });
    
    console.log('✅ Connexion à la base de données réussie');
    
    // Récupérer toutes les tâches avec leurs IDs
    const [tasks] = await connection.execute(`
      SELECT id, titre, dao_id, progress, statut, date_creation
      FROM tasks 
      ORDER BY id ASC
    `);
    
    console.log(`\n📋 Nombre total de tâches: ${tasks.length}`);
    
    console.log('\n--- Détail des tâches dans la base ---');
    tasks.forEach((task, index) => {
      console.log(`🔍 Tâche ${index + 1}:`);
      console.log(`   ID: ${task.id}`);
      console.log(`   Titre: "${task.titre || 'vide'}"`);
      console.log(`   DAO ID: ${task.dao_id}`);
      console.log(`   Progression: ${task.progress || 0}%`);
      console.log(`   Statut: ${task.statut || 'vide'}`);
      console.log(`   Date création: ${task.date_creation || 'vide'}`);
      console.log('');
    });
    
    // Vérifier si les IDs commencent bien par 1
    const ids = tasks.map(t => t.id);
    const minId = Math.min(...ids);
    const maxId = Math.max(...ids);
    const hasGaps = ids.some((id, index) => index > 0 && id !== ids[index - 1] + 1);
    
    console.log('--- Analyse des IDs ---');
    console.log(`📊 ID minimum: ${minId}`);
    console.log(`📊 ID maximum: ${maxId}`);
    console.log(`📊 IDs: [${ids.join(', ')}]`);
    console.log(`🔍 Commence par 1: ${minId === 1 ? '✅ Oui' : '❌ Non'}`);
    console.log(`🔍 Séquence continue: ${hasGaps ? '❌ Non (trous)' : '✅ Oui'}`);
    
    // Comparer avec l'API
    console.log('\n--- Comparaison avec l\'API ---');
    const apiResponse = await fetch('http://localhost:3000/api/tasks');
    if (apiResponse.ok) {
      const apiData = await apiResponse.json();
      const apiTasks = apiData.data || [];
      const apiIds = apiTasks.map(t => t.id).sort((a, b) => a - b);
      
      console.log(`📊 API IDs: [${apiIds.join(', ')}]`);
      console.log(`🔍 Correspondance base/API: ${JSON.stringify(ids) === JSON.stringify(apiIds) ? '✅ Oui' : '❌ Non'}`);
      
      if (JSON.stringify(ids) !== JSON.stringify(apiIds)) {
        console.log('⚠️  Différence détectée entre base et API !');
      }
    } else {
      console.log('❌ Impossible de récupérer les données de l\'API');
    }
    
    // Simulation des labels dans le graphique
    console.log('\n--- Simulation labels graphique ---');
    const labels = tasks.map(t => `Tâche ${t.id}`);
    console.log('📊 Labels qui seront affichés:');
    labels.forEach((label, index) => {
      console.log(`   ${index + 1}. "${label}"`);
    });
    
    console.log('\n=== RÉSULTAT FINAL ===');
    console.log('🎯 Vérification terminée:');
    console.log(`   ✅ IDs réels: [${ids.join(', ')}]`);
    console.log(`   ✅ Commence par ${minId}`);
    console.log(`   ✅ Format graphique: "Tâche {ID}"`);
    console.log(`   ✅ ${tasks.length} tâches trouvées`);
    
    if (minId !== 1) {
      console.log(`⚠️  Attention: Les IDs ne commencent pas par 1 mais par ${minId}`);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkTaskIdsInDatabase();
