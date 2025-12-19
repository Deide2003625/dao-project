import { db } from "../lib/db";
import bcrypt from "bcrypt";
import { RowDataPacket } from "mysql2";

interface User {
  username: string;
  email: string;
  password: string;
  role_id: number; // Corrigé : doit être un entier correspondant à la table roles
}

async function seedDatabase() {
  const connection = await db();

  try {
    // Vérifier si la table users existe
    const [tables] = await connection.execute<RowDataPacket[]>(
      `SELECT TABLE_NAME 
       FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'`,
      [process.env.DB_NAME || "dao"],
    );

    if (tables.length === 0) {
      console.error(
        "La table 'users' n'existe pas. Veuillez d'abord exécuter les migrations.",
      );
      process.exit(1);
    }

    // Vérifier si des utilisateurs existent déjà
    const [existingUsers] = await connection.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM users",
    );

    if (existingUsers[0].count > 0) {
      console.log(
        "Ajout de nouveaux utilisateurs à la base de données existante...",
      );
    }

    // Données des utilisateurs avec role_id correct
    const users: User[] = [
      {
        username: "admin",
        email: "admin@example.com",
        password: await bcrypt.hash("admin123", 10),
        role_id: 2, // Administrateur
      },
      {
        username: "user1",
        email: "user1@example.com",
        password: await bcrypt.hash("user1123", 10),
        role_id: 4, // MembreEquipe
      },
      {
        username: "user2",
        email: "user2@example.com",
        password: await bcrypt.hash("user2123", 10),
        role_id: 4,
      },
      {
        username: "manager1",
        email: "manager@example.com",
        password: await bcrypt.hash("manager123", 10),
        role_id: 3, // ChefProjet
      },
      {
        username: "dev1",
        email: "dev@example.com",
        password: await bcrypt.hash("dev1234", 10),
        role_id: 4, // MembreEquipe
      },
      {
        username: "Directeur General",
        email: "directeur@example.com",
        password: await bcrypt.hash("directeur123", 10),
        role_id: 1, // Directeur General
      },
    ];

    // Insérer les utilisateurs
    let addedUsers = 0;
    for (const user of users) {
      try {
        const [existing] = await connection.execute<RowDataPacket[]>(
          "SELECT id FROM users WHERE email = ?",
          [user.email],
        );

        if (existing.length === 0) {
          await connection.execute(
            "INSERT INTO users (username, email, password, role_id) VALUES (?, ?, ?, ?)",
            [user.username, user.email, user.password, user.role_id],
          );
          console.log(
            `Utilisateur créé : ${user.email} (role_id: ${user.role_id})`,
          );
          addedUsers++;
        } else {
          console.log(`L'utilisateur ${user.email} existe déjà, ignoré.`);
        }
      } catch (error) {
        console.error(`Erreur avec l'utilisateur ${user.email}:`, error);
      }
    }

    console.log(`\n${addedUsers} nouveaux utilisateurs ont été ajoutés.`);
  } catch (error) {
    console.error("Erreur lors du peuplement de la base de données :", error);
  } finally {
    await connection.end();
    process.exit(0);
  }
}

seedDatabase();
