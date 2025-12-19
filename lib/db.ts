// lib/db.js
import mysql from "mysql2/promise";

// Création d'un pool de connexions au démarrage
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "erwann",
  password: process.env.DB_PASSWORD || "erwann",
  database: process.env.DB_NAME || "dao",
  waitForConnections: true,
  connectionLimit: 10, // Nombre maximum de connexions dans le pool
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // 10 secondes
});

// Vérification de la structure de la base de données au démarrage
(async () => {
  try {
    await verifyDatabaseStructure(pool);
    console.log("Vérification de la structure de la base de données terminée");
  } catch (error) {
    console.error(
      "Erreur lors de la vérification de la structure de la base de données:",
      error,
    );
  }
})();

// Fonction pour obtenir une connexion du pool
export async function db() {
  try {
    return pool;
  } catch (error) {
    console.error("Erreur lors de l'obtention d'une connexion:", error);
    throw error;
  }
}

async function verifyDatabaseStructure(connection: mysql.Pool) {
  try {
    // Vérifiez si la table users existe
    const [usersTable] = await connection.execute<mysql.RowDataPacket[]>(
      `
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
    `,
      [process.env.DB_NAME || "dao"],
    );

    // Vérifiez si la table sessions existe
    const [sessionsTable] = await connection.execute<mysql.RowDataPacket[]>(
      `
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'sessions'
    `,
      [process.env.DB_NAME || "dao"],
    );

    // Vérifiez si la table accounts existe
    const [accountsTable] = await connection.execute<mysql.RowDataPacket[]>(
      `
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'accounts'
    `,
      [process.env.DB_NAME || "dao"],
    );

    if (usersTable.length === 0) {
      console.log("Création de la table users...");
      await connection.execute(`
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role_id VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Créez un index sur la colonne email
      await connection.execute(`
        CREATE INDEX idx_email ON users(email);
      `);

      console.log("Table users créée avec succès");
    }

    if (sessionsTable.length === 0) {
      console.log("Création de la table sessions pour NextAuth...");
      await connection.execute(`
        CREATE TABLE sessions (
          id VARCHAR(255) NOT NULL,
          session_token VARCHAR(255) NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          expires TIMESTAMP NOT NULL,
          UNIQUE(session_token),
          PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log("Table sessions créée avec succès");
    }

    if (accountsTable.length === 0) {
      console.log("Création de la table accounts pour NextAuth...");
      await connection.execute(`
        CREATE TABLE accounts (
          id VARCHAR(255) NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          type VARCHAR(255) NOT NULL,
          provider VARCHAR(255) NOT NULL,
          provider_account_id VARCHAR(255) NOT NULL,
          refresh_token TEXT,
          access_token TEXT,
          expires_at BIGINT,
          token_type VARCHAR(255),
          scope VARCHAR(255),
          id_token TEXT,
          session_state TEXT,
          PRIMARY KEY (id),
          UNIQUE(provider, provider_account_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log("Table accounts créée avec succès");
    }
  } catch (error) {
    console.error(
      "Erreur lors de la vérification de la base de données:",
      error,
    );
    throw error;
  }
}
