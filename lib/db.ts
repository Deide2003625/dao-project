import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  if (!pool) {
    const DB_USER = process.env.DB_USER;
    if (!DB_USER) {
      throw new Error("DB_USER manquant dans les variables d'environnement");
    }

    pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: DB_USER,
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "dao",
      port: Number(process.env.DB_PORT || 3306),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });

    console.log("🗄️ [DB] Pool créé avec la config:", {
      host: process.env.DB_HOST,
      user: DB_USER,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    });
  }

  return pool;
}

export async function db() {
  return getPool();
}

export async function verifyDatabaseStructure() {
  await _verifyDatabaseStructure(getPool());
}

async function tableExists(connection: mysql.Pool, table: string): Promise<boolean> {
  const [rows] = await connection.execute<mysql.RowDataPacket[]>(
    `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
    [process.env.DB_NAME || "dao", table]
  );
  return rows.length > 0;
}

async function _verifyDatabaseStructure(connection: mysql.Pool) {
  // 1) USERS d'abord (obligatoire pour les FK)
  const usersExists = await tableExists(connection, "users");
  if (!usersExists) {
    console.log("Création de la table users...");
    await connection.execute(`
      CREATE TABLE users (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role_id INT NOT NULL,
        url_photo VARCHAR(500) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role_id (role_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Table users créée avec succès");
  }

  // 2) Sessions
  const sessionsExists = await tableExists(connection, "sessions");
  if (!sessionsExists) {
    console.log("Création de la table sessions...");
    await connection.execute(`
      CREATE TABLE sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        session_token VARCHAR(255) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        ip_address VARCHAR(45) NULL,
        user_agent TEXT NULL,
        INDEX idx_session_token (session_token),
        INDEX idx_user_id (user_id),
        INDEX idx_expires_at (expires_at),
        CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Table sessions créée avec succès");
  }

  // 3) Accounts
  const accountsExists = await tableExists(connection, "accounts");
  if (!accountsExists) {
    console.log("Création de la table accounts...");
    await connection.execute(`
      CREATE TABLE accounts (
        id VARCHAR(255) NOT NULL,
        user_id BIGINT UNSIGNED NOT NULL,
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
        UNIQUE(provider, provider_account_id),
        INDEX idx_accounts_user_id (user_id),
        CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Table accounts créée avec succès");
  }

  // 4) Teams, DAOs, etc.
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS teams (
      id VARCHAR(100) PRIMARY KEY,
      team_code VARCHAR(100) UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS daos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      numero VARCHAR(100) UNIQUE,
      date_depot DATE,
      objet TEXT,
      description TEXT,
      reference VARCHAR(255),
      autorite VARCHAR(255),
      chef_id BIGINT UNSIGNED NULL,
      team_id VARCHAR(100) NULL,
      statut VARCHAR(50) NOT NULL DEFAULT 'EN_COURS',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_daos_created_at (created_at),
      INDEX idx_daos_chef_id (chef_id),
      INDEX idx_daos_team_id (team_id),
      CONSTRAINT fk_daos_chef FOREIGN KEY (chef_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS team_members (
      team_id VARCHAR(100),
      user_id BIGINT UNSIGNED,
      PRIMARY KEY (team_id, user_id),
      INDEX idx_team_members_user_id (user_id),
      CONSTRAINT fk_team_members_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      CONSTRAINT fk_team_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS dao_sequences (
      year INT PRIMARY KEY,
      seq INT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 5) Purchases
  const purchasesExists = await tableExists(connection, "purchases");
  if (!purchasesExists) {
    console.log("Création de la table purchases...");
    await connection.execute(`
      CREATE TABLE purchases (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        status_report VARCHAR(255) NOT NULL,
        office VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        date DATE NOT NULL,
        gross_amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Table purchases créée avec succès");
  }

  // 6) Messages
  const messagesExists = await tableExists(connection, "messages");
  if (!messagesExists) {
    console.log("Création de la table messages...");
    await connection.execute(`
      CREATE TABLE messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        task_id INT NOT NULL,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        mentioned_user_id INT NULL,
        mentioned_user_name VARCHAR(255) NULL,
        is_public TINYINT(1) DEFAULT 1,
        INDEX idx_task_id (task_id),
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Table messages créée avec succès");
  }

  // 7) Notifications
  const notificationsExists = await tableExists(connection, "notifications");
  if (!notificationsExists) {
    console.log("Création de la table notifications...");
    await connection.execute(`
      CREATE TABLE notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_notifications_user (user_id),
        INDEX idx_notifications_created_at (created_at),
        CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Table notifications créée avec succès");
  }

  console.log("✅ Vérification DB terminée");
}