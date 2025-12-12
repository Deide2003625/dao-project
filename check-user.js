import mysql from 'mysql2/promise';

async function checkUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'dao',
  });

  try {
    // Vérifier la structure de la table users
    const [columns] = await connection.query('SHOW COLUMNS FROM users');
    console.log('Structure de la table users :', columns);

    // Vérifier les données d'un utilisateur
    const [users] = await connection.query('SELECT * FROM users LIMIT 1');
    console.log('Données utilisateur (premier enregistrement) :', users[0]);
  } catch (error) {
    console.error('Erreur lors de la vérification de la base de données :', error);
  } finally {
    await connection.end();
  }
}

checkUser();
