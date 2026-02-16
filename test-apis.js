// Test script pour vérifier les APIs
const mysql = require('mysql2/promise');

async function testAPIs() {
  try {
    console.log('=== TEST DES APIS ===');
    
    // Connexion à la base
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'dao'
    });
    
    console.log('Connexion à la base réussie');
    
    // Test structure table users
    const [structure] = await connection.execute('DESCRIBE users');
    console.log('Structure table users:', structure);
    
    // Test récupération utilisateurs
    const [users] = await connection.execute('SELECT * FROM users');
    console.log('Utilisateurs trouvés:', users.length);
    if (users.length > 0) {
      console.log('Premier utilisateur:', users[0]);
    }
    
    // Test structure table daos
    const [daoStructure] = await connection.execute('DESCRIBE daos');
    console.log('Structure table daos:', daoStructure);
    
    // Test récupération DAOs
    const [daos] = await connection.execute('SELECT * FROM daos');
    console.log('DAOs trouvés:', daos.length);
    if (daos.length > 0) {
      console.log('Premier DAO:', daos[0]);
    }
    
    await connection.end();
    console.log('Test terminé avec succès');
    
  } catch (error) {
    console.error('Erreur lors du test:', error);
  }
}

testAPIs();
