const mysql = require('mysql2/promise');

async function checkTasks100() {
  console.log('=== VÉRIFICATION DES TÂCHES À 100% ===');
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dao'
  });
  
  try {
    // Vérifier toutes les tâches
    const [tasks] = await connection.execute('SELECT * FROM tasks ORDER BY progress DESC');
    console.log('\n--- Toutes les tâches ---');
    tasks.forEach((task, index) => {
      console.log(`${index + 1}. ID: ${task.id}, DAO: ${task.dao_id}, Titre: ${task.titre || 'Sans titre'}, Progression: ${task.progress}%`);
    });
    
    // Vérifier spécifiquement les tâches à 100%
    const [tasks100] = await connection.execute('SELECT * FROM tasks WHERE progress = 100');
    console.log(`\n--- Tâches à 100% (${tasks100.length}) ---`);
    tasks100.forEach((task, index) => {
      console.log(`${index + 1}. ID: ${task.id}, DAO: ${task.dao_id}, Titre: ${task.titre || 'Sans titre'}`);
    });
    
    // Vérifier les DAOs associés
    if (tasks100.length > 0) {
      console.log('\n--- DAOs associés aux tâches à 100% ---');
      for (const task of tasks100) {
        const [daos] = await connection.execute('SELECT * FROM daos WHERE id = ?', [task.dao_id]);
        if (daos.length > 0) {
          const dao = daos[0];
          console.log(`DAO ${task.dao_id}: ${dao.reference || 'Sans référence'} - ${dao.objet || 'Sans objet'}`);
        }
      }
    }
    
    // Vérifier la distribution des progressions
    console.log('\n--- Distribution des progressions ---');
    const [progressStats] = await connection.execute(`
      SELECT 
        progress,
        COUNT(*) as count,
        GROUP_CONCAT(titre) as tasks
      FROM tasks 
      GROUP BY progress 
      ORDER BY progress DESC
    `);
    
    progressStats.forEach(stat => {
      console.log(`${stat.progress}%: ${stat.count} tâche(s)`);
      if (stat.tasks) {
        const taskList = stat.tasks.split(',').slice(0, 3).join(', ');
        console.log(`   Exemples: ${taskList}${stat.tasks.split(',').length > 3 ? '...' : ''}`);
      }
    });
    
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await connection.end();
  }
}

checkTasks100();
