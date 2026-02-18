const mysql = require('mysql2/promise');

async function createHiddenMessagesTable() {
  try {
    console.log('=== CRÉATION DE LA TABLE hidden_messages ===');
    
    // Connexion à la base de données
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'dao',
      port: 3306
    });

    // Créer la table hidden_messages si elle n'existe pas
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS hidden_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        message_id INT NOT NULL,
        hidden_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_message (user_id, message_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
      )
    `;

    await connection.execute(createTableQuery);
    
    // Vérifier la structure de la table
    const [tableStructure] = await connection.execute('DESCRIBE hidden_messages');
    console.log('📋 Structure de la table hidden_messages:');
    console.table(tableStructure);
    
    await connection.end();
    
    console.log('✅ Table hidden_messages créée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de la table hidden_messages:', error);
  }
}

createHiddenMessagesTable();
