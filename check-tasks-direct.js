// Vérification directe avec MySQL
const mysql = require('mysql2/promise');

async function checkTasksTableDirect() {
  console.log('=== VÉRIFICATION TABLE TASKS (DIRECT) ===');
  
  try {
    // Configuration de la base de données
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'dao_db'
    });
    
    console.log('\n--- 1. Vérifier si la table tasks existe ---');
    
    // Vérifier si la table existe
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'tasks'
    `);
    
    console.log('Tables trouvées:', tables);
    
    if (tables.length === 0) {
      console.log('❌ La table tasks n\'existe pas');
      
      console.log('\n--- 2. Création de la table tasks ---');
      
      // Créer la table tasks
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS tasks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          dao_id INT NOT NULL,
          name VARCHAR(255) NOT NULL,
          progress INT DEFAULT 0,
          comment TEXT,
          assigned_to VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (dao_id) REFERENCES daos(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      
      console.log('✅ Table tasks créée');
    } else {
      console.log('✅ La table tasks existe déjà');
      
      console.log('\n--- 3. Structure de la table tasks ---');
      
      // Vérifier la structure
      const [structure] = await connection.execute(`
        DESCRIBE tasks
      `);
      
      console.log('Structure:', structure);
    }
    
    console.log('\n--- 4. Contenu de la table tasks ---');
    
    // Vérifier le contenu
    const [tasks] = await connection.execute(`
      SELECT * FROM tasks LIMIT 10
    `);
    
    console.log(`Nombre de tâches: ${tasks.length}`);
    
    if (tasks.length > 0) {
      console.log('Premières tâches:');
      tasks.forEach((task, index) => {
        console.log(`  ${index + 1}. ID=${task.id}, DAO_ID=${task.dao_id}, Nom=${task.name}, Progression=${task.progress}%`);
      });
    } else {
      console.log('❌ Aucune tâche trouvée dans la base');
      
      console.log('\n--- 5. Insertion de tâches d\'exemple ---');
      
      // Insérer des tâches d'exemple pour le DAO 40
      const exampleTasks = [
        { dao_id: 40, name: "Résumé sommaire DAO et Création du drive", progress: 10, comment: "À faire", assigned_to: "Jean Dupont" },
        { dao_id: 40, name: "Demande de caution et garanties", progress: 0, comment: "À faire", assigned_to: "Marie Martin" },
        { dao_id: 40, name: "Identification et renseignement des profils dans le drive", progress: 0, comment: "À faire", assigned_to: "Pierre Durand" },
        { dao_id: 40, name: "Identification et renseignement des ABE dans le drive", progress: 0, comment: "À faire", assigned_to: "Sophie Bernard" },
        { dao_id: 40, name: "Légalisation des ABE, diplômes, certificats, attestations et pièces administratives requis", progress: 0, comment: "À faire", assigned_to: "Jean Dupont" },
        { dao_id: 40, name: "Indication directive d'élaboration de l'offre financier", progress: 0, comment: "À faire", assigned_to: "Marie Martin" },
        { dao_id: 40, name: "Elaboration de la méthodologie", progress: 0, comment: "À faire", assigned_to: "Pierre Durand" },
        { dao_id: 40, name: "Planification prévisionnelle", progress: 0, comment: "À faire", assigned_to: "Sophie Bernard" },
        { dao_id: 40, name: "Identification des références précises des équipements et matériels", progress: 0, comment: "À faire", assigned_to: "Jean Dupont" },
        { dao_id: 40, name: "Demande de cotation", progress: 60, comment: "En cours", assigned_to: "Marie Martin" },
        { dao_id: 40, name: "Elaboration du squelette des offres", progress: 0, comment: "À faire", assigned_to: "Pierre Durand" },
        { dao_id: 40, name: "Rédaction du contenu des OF et OT", progress: 30, comment: "Brouillon", assigned_to: "Sophie Bernard" },
        { dao_id: 40, name: "Contrôle et validation des offres", progress: 0, comment: "À faire", assigned_to: "Jean Dupont" },
        { dao_id: 40, name: "Impression et présentation des offres (Valider l'étiquette)", progress: 0, comment: "À faire", assigned_to: "Marie Martin" },
        { dao_id: 40, name: "Dépôt des offres et clôture", progress: 0, comment: "À faire", assigned_to: "Pierre Durand" }
      ];
      
      for (const task of exampleTasks) {
        await connection.execute(`
          INSERT INTO tasks (dao_id, name, progress, comment, assigned_to)
          VALUES (?, ?, ?, ?, ?)
        `, [task.dao_id, task.name, task.progress, task.comment, task.assigned_to]);
      }
      
      console.log('✅ 15 tâches d\'exemple insérées pour le DAO 40');
    }
    
    console.log('\n--- 6. Tâches par DAO ---');
    
    // Vérifier les tâches par DAO
    const [tasksByDao] = await connection.execute(`
      SELECT 
        dao_id,
        COUNT(*) as task_count,
        AVG(progress) as avg_progress
      FROM tasks 
      GROUP BY dao_id
      ORDER BY dao_id
    `);
    
    console.log('Tâches par DAO:');
    tasksByDao.forEach((row) => {
      console.log(`  DAO ${row.dao_id}: ${row.task_count} tâches, progression moyenne: ${Math.round(row.avg_progress)}%`);
    });
    
    await connection.end();
    
    console.log('\n=== CONCLUSION ===');
    console.log('✅ Vérification terminée');
    console.log('🔧 La table tasks est prête pour être utilisée dans l\'API');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
    console.error('Stack:', error.stack);
  }
}

checkTasksTableDirect();
