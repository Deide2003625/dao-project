import mysql from "mysql2/promise";

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "dao";
const DB_PORT = Number(process.env.DB_PORT || 3306);

export const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

export async function db() {
  if (!DB_USER) {
    throw new Error("DB_USER manquant dans les variables d'environnement");
  }
  return pool;
}

export async function verifyDatabaseStructure() {
  await _verifyDatabaseStructure(pool);
}

async function tableExists(connection: mysql.Pool, table: string) {
  const [rows] = await connection.execute<mysql.RowDataPacket[]>(
    `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
    [DB_NAME, table]
  );
  return rows.length > 0;
}

async function _verifyDatabaseStructure(connection: mysql.Pool) {
  // ... tout ton code existant, inchangé
}