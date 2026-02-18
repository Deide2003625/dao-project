const mysql = require('mysql2/promise');

async function checkUserIds() {
  try {
    console.log('=== VÉRIFICATION DES IDs UTILISATEURS ===');
    
    // Connexion à la base de données
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'dao',
      port: 3306
    });

    console.log('✅ Connexion à la base réussie');

    // Vérifier les IDs dans la table users
    const [users] = await connection.execute("SELECT id, username FROM users");
    console.log('👥 IDs dans la table users:');
    console.table(users);

    // Vérifier les user_id dans la table messages
    const [messages] = await connection.execute("SELECT id, user_id, content FROM messages");
    console.log('📝 user_id dans la table messages:');
    console.table(messages);

    // Vérifier la jointure manuellement
    console.log('\n🔍 Test de la jointure manuelle:');
    const [jointure] = await connection.execute(`
      SELECT m.id as message_id, m.user_id as message_user_id, m.content,
             u.id as user_table_id, u.username
      FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.task_id = 1
    `);
    console.table(jointure);

    await connection.end();
    console.log('✅ Connexion fermée');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  }
}

checkUserIds();
