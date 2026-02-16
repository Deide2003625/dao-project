// Vérification de la structure complète de la table task pour trouver la colonne id_task
const mysql = require('mysql2/promise');

async function checkTaskTableStructure() {
  console.log('=== VÉRIFICATION STRUCTURE TABLE TASK ===');
  
  try {
    // Essayer différentes connexions possibles
    const databases = ['dao_project', 'daoproject', 'dao'];
    let connection = null;
    let dbUsed = null;
    
    for (const db of databases) {
      try {
        connection = await mysql.createConnection({
          host: 'localhost',
          user: 'root',
          password: '',
          database: db
        });
        dbUsed = db;
        console.log(`✅ Connexion réussie à la base: ${db}`);
        break;
      } catch (error) {
        console.log(`❌ Base ${db} non disponible`);
      }
    }
    
    if (!connection) {
      console.log('❌ Impossible de se connecter à la base de données');
      return;
    }
    
    // Vérifier la structure de la table task
    console.log('\n--- Structure de la table task ---');
    const [columns] = await connection.execute(`
      DESCRIBE task
    `);
    
    console.log('📋 Colonnes trouvées:');
    columns.forEach((column, index) => {
      console.log(`   ${index + 1}. ${column.Field} - ${column.Type} - ${column.Null} - ${column.Key} - ${column.Default}`);
    });
    
    // Vérifier s'il y a une colonne id_task
    const hasIdTask = columns.some(col => col.Field === 'id_task');
    const hasId = columns.some(col => col.Field === 'id');
    
    console.log(`\n🔍 Vérification des colonnes d'ID:`);
    console.log(`   id_task: ${hasIdTask ? '✅ Présente' : '❌ Absente'}`);
    console.log(`   id: ${hasId ? '✅ Présente' : '❌ Absente'}`);
    
    // Si la table s'appelle "tasks" au lieu de "task"
    if (columns.length === 0) {
      console.log('\n--- Tentative avec table "tasks" ---');
      try {
        const [columnsTasks] = await connection.execute(`
          DESCRIBE tasks
        `);
        
        console.log('📋 Colonnes trouvées dans "tasks":');
        columnsTasks.forEach((column, index) => {
          console.log(`   ${index + 1}. ${column.Field} - ${column.Type} - ${column.Null} - ${column.Key} - ${column.Default}`);
        });
        
        const hasIdTaskTasks = columnsTasks.some(col => col.Field === 'id_task');
        const hasIdTasks = columnsTasks.some(col => col.Field === 'id');
        
        console.log(`\n🔍 Vérification des colonnes d'ID dans "tasks":`);
        console.log(`   id_task: ${hasIdTaskTasks ? '✅ Présente' : '❌ Absente'}`);
        console.log(`   id: ${hasIdTasks ? '✅ Présente' : '❌ Absente'}`);
        
        // Récupérer les données pour vérifier
        const [tasksData] = await connection.execute(`
          SELECT * FROM tasks LIMIT 5
        `);
        
        console.log('\n--- Données de la table "tasks" ---');
        tasksData.forEach((task, index) => {
          console.log(`🔍 Tâche ${index + 1}:`);
          Object.keys(task).forEach(key => {
            console.log(`   ${key}: ${task[key]}`);
          });
          console.log('');
        });
        
      } catch (error) {
        console.log('❌ Table "tasks" non trouvée');
      }
    } else {
      // Récupérer les données pour vérifier
      const [tasksData] = await connection.execute(`
        SELECT * FROM task LIMIT 5
      `);
      
      console.log('\n--- Données de la table "task" ---');
      tasksData.forEach((task, index) => {
        console.log(`🔍 Tâche ${index + 1}:`);
        Object.keys(task).forEach(key => {
          console.log(`   ${key}: ${task[key]}`);
        });
        console.log('');
      });
    }
    
    // Vérifier toutes les tables qui contiennent "task"
    console.log('\n--- Recherche de tables contenant "task" ---');
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE '%task%'
    `);
    
    if (tables.length > 0) {
      console.log('📋 Tables trouvées:');
      tables.forEach((table, index) => {
        const tableName = Object.values(table)[0];
        console.log(`   ${index + 1}. ${tableName}`);
      });
    } else {
      console.log('❌ Aucune table contenant "task" trouvée');
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkTaskTableStructure();
