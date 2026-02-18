const mysql = require('mysql2/promise');

async function fixUserIds() {
  try {
    console.log('=== CORRECTION DES USER_ID DANS MESSAGES ===');
    
    // Connexion à la base de données
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'dao',
      port: 3306
    });

    console.log('✅ Connexion à la base réussie');

    // Mettre à jour les user_id pour qu'ils correspondent aux vrais IDs
    const updates = [
      { oldId: 1, newId: 41, username: 'admin' },
      { oldId: 2, newId: 45, username: 'user1' },
      { oldId: 3, newId: 41, username: 'admin' }
    ];

    for (const update of updates) {
      console.log(`🔄 Mise à jour: user_id ${update.oldId} -> ${update.newId} (${update.username})`);
      
      const [result] = await connection.execute(
        'UPDATE messages SET user_id = ? WHERE user_id = ?',
        [update.newId, update.oldId]
      );
      
      console.log(`✅ ${result.affectedRows} lignes mises à jour`);
    }

    // Vérifier le résultat
    console.log('\n🔍 Vérification après correction:');
    const [messages] = await connection.execute(`
      SELECT m.id, m.user_id, m.content, u.username
      FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.task_id = 1
    `);
    console.table(messages);

    await connection.end();
    console.log('✅ Connexion fermée');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error.message);
  }
}

fixUserIds();
