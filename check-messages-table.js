const mysql = require('mysql2/promise');

async function checkMessagesTable() {
  try {
    console.log('=== VÉRIFICATION DE LA TABLE MESSAGES ===');
    
    // Connexion à la base de données
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'dao',
      port: 3306
    });

    console.log('✅ Connexion à la base réussie');

    // Vérifier si la table messages existe
    const [tables] = await connection.execute("SHOW TABLES LIKE 'messages'");
    console.log('Tables trouvées:', tables);

    if (tables.length === 0) {
      console.log('❌ La table "messages" n\'existe pas');
      
      // Créer la table messages si elle n'existe pas
      console.log('🔧 Création de la table "messages"...');
      await connection.execute(`
        CREATE TABLE messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          task_id INT NOT NULL,
          user_id INT NOT NULL,
          content TEXT NOT NULL,
          mentioned_user_id INT NULL,
          mentioned_user_name VARCHAR(255) NULL,
          is_public BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES tasks(id),
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (mentioned_user_id) REFERENCES users(id)
        )
      `);
      console.log('✅ Table "messages" créée avec succès');
    } else {
      console.log('✅ La table "messages" existe déjà');
      
      // Vérifier la structure de la table
      const [structure] = await connection.execute("DESCRIBE messages");
      console.log('📋 Structure de la table "messages":');
      console.table(structure);
      
      // Vérifier le contenu
      const [messages] = await connection.execute("SELECT * FROM messages LIMIT 5");
      console.log('📝 Contenu de la table "messages" (5 premiers enregistrements):');
      console.table(messages);
    }

    await connection.end();
    console.log('✅ Connexion fermée');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  }
}

checkMessagesTable();
