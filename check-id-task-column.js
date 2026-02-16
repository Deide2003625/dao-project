// Vérification des valeurs de la colonne id_task dans la table tasks
const mysql = require('mysql2/promise');

async function checkIdTaskColumn() {
  console.log('=== VÉRIFICATION COLONNE ID_TASK ===');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'dao'
    });
    
    console.log('✅ Connexion réussie à la base "dao"');
    
    // Récupérer toutes les données avec id et id_task
    const [tasksData] = await connection.execute(`
      SELECT id, id_task, titre, dao_id, progress 
      FROM tasks 
      ORDER BY id
    `);
    
    console.log(`\n📋 Nombre de tâches: ${tasksData.length}`);
    
    console.log('\n--- Données complètes (id et id_task) ---');
    tasksData.forEach((task, index) => {
      console.log(`🔍 Tâche ${index + 1}:`);
      console.log(`   id: ${task.id}`);
      console.log(`   id_task: ${task.id_task}`);
      console.log(`   titre: "${task.titre}"`);
      console.log(`   dao_id: ${task.dao_id}`);
      console.log(`   progress: ${task.progress}%`);
      console.log('');
    });
    
    // Analyser les valeurs de id_task
    const idTasks = tasksData.map(t => t.id_task);
    const ids = tasksData.map(t => t.id);
    
    console.log('--- Analyse des colonnes ---');
    console.log(`📊 ids: [${ids.join(', ')}]`);
    console.log(`📊 id_tasks: [${idTasks.join(', ')}]`);
    
    const minIdTask = Math.min(...idTasks);
    const maxIdTask = Math.max(...idTasks);
    const hasNullIdTask = idTasks.includes(null);
    const hasZeroIdTask = idTasks.includes(0);
    
    console.log(`📊 id_task min: ${minIdTask}`);
    console.log(`📊 id_task max: ${maxIdTask}`);
    console.log(`🔍 id_task commence par 1: ${minIdTask === 1 ? '✅ Oui' : '❌ Non'}`);
    console.log(`🔍 Contient des NULL: ${hasNullIdTask ? '✅ Oui' : '❌ Non'}`);
    console.log(`🔍 Contient des 0: ${hasZeroIdTask ? '✅ Oui' : '❌ Non'}`);
    
    // Vérifier si id_task correspond mieux à ce que l'utilisateur veut
    console.log('\n--- Comparaison pour le graphique ---');
    console.log('Option 1 - Utiliser "id":');
    ids.forEach((id, index) => {
      console.log(`   Tâche ${index + 1}: "Tâche ${id}"`);
    });
    
    console.log('\nOption 2 - Utiliser "id_task":');
    idTasks.forEach((idTask, index) => {
      const label = idTask === null || idTask === 0 ? `Tâche ${ids[index]}` : `Tâche ${idTask}`;
      console.log(`   Tâche ${index + 1}: "${label}"`);
    });
    
    // Recommandation
    console.log('\n--- Recommandation ---');
    if (minIdTask === 1 && !hasNullIdTask && !hasZeroIdTask) {
      console.log('🎯 Utiliser "id_task" car il commence par 1');
      console.log('✅ Modification recommandée: `Tâche ${t.id_task}`');
    } else {
      console.log('🎯 Garder "id" car id_task contient des valeurs problématiques');
      console.log('✅ Garder la modification actuelle: `Tâche ${t.id}`');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkIdTaskColumn();
