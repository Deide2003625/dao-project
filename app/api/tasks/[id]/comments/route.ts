import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function ensureTaskTables(connection: any) {
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      dao_id INT NOT NULL,
      titre VARCHAR(255) NOT NULL,
      description TEXT,
      statut ENUM('a_faire', 'en_cours', 'termine') DEFAULT 'a_faire',
      date_creation DATE,
      date_echeance DATE,
      priorite ENUM('basse', 'moyenne', 'haute') DEFAULT 'moyenne',
      assigned_to BIGINT UNSIGNED,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_tasks_dao (dao_id),
      INDEX idx_tasks_assigned (assigned_to),
      CONSTRAINT fk_tasks_dao FOREIGN KEY (dao_id) REFERENCES daos(id) ON DELETE CASCADE,
      CONSTRAINT fk_tasks_user FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      task_id INT NOT NULL,
      user_id BIGINT UNSIGNED NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      mentioned_user_id BIGINT UNSIGNED,
      is_public BOOLEAN DEFAULT TRUE,
      INDEX idx_comments_task (task_id),
      INDEX idx_comments_user (user_id),
      INDEX idx_comments_mentioned (mentioned_user_id),
      CONSTRAINT fk_comments_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_comments_mentioned FOREIGN KEY (mentioned_user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

function roleLabel(roleId: string | null | undefined) {
  if (roleId === "2") return "Admin";
  if (roleId === "3") return "ChefProjet";
  if (roleId === "4") return "MembreEquipe";
  return "Utilisateur";
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const connection = await db();
    await ensureTaskTables(connection);

    const [rows]: any = await connection.execute(
      `
      SELECT
        c.id,
        c.text,
        c.created_at,
        c.user_id,
        c.mentioned_user_id,
        c.is_public,
        u.username,
        u.role_id,
        u2.username as mentioned_username
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users u2 ON c.mentioned_user_id = u2.id
      WHERE c.task_id = ?
      ORDER BY c.created_at DESC
    `,
      [id],
    );

    const data = (rows || []).map((row: any) => ({
      id: row.id,
      task_id: id,
      user_id: row.user_id,
      content: row.text,
      created_at: row.created_at,
      user_name: row.username || "Utilisateur",
      mentioned_user_id: row.mentioned_user_id || null,
      mentioned_user_name: row.mentioned_username || null,
      is_public: row.is_public !== 0, // Convertir en booléen (MySQL retourne 0/1)
      role: roleLabel(row.role_id),
    }));

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("API /api/tasks/[id]/comments GET error:", err?.message, err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { user_id, content, mentioned_user_id, is_public } = body;

    if (!user_id || !content) {
      return NextResponse.json(
        { success: false, message: "Champs obligatoires manquants" },
        { status: 400 },
      );
    }

    const connection = await db();
    await ensureTaskTables(connection);

    // Insérer le commentaire avec les informations de mention
    const [result]: any = await connection.execute(
      `INSERT INTO comments 
       (task_id, user_id, text, mentioned_user_id, is_public) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        id,
        user_id,
        content,
        mentioned_user_id || null,
        is_public !== false // Par défaut true si non spécifié
      ]
    );

    // Récupérer le commentaire inséré avec les noms d'utilisateurs
    const [rows]: any = await connection.execute(
      `SELECT 
        c.*, 
        u1.username as user_name,
        u2.username as mentioned_username
       FROM comments c
       LEFT JOIN users u1 ON c.user_id = u1.id
       LEFT JOIN users u2 ON c.mentioned_user_id = u2.id
       WHERE c.id = ?`,
      [result.insertId]
    );

    const comment = {
      id: rows[0].id,
      task_id: rows[0].task_id,
      user_id: rows[0].user_id,
      content: rows[0].text,
      created_at: rows[0].created_at,
      user_name: rows[0].user_name || 'Utilisateur',
      mentioned_user_id: rows[0].mentioned_user_id || null,
      mentioned_user_name: rows[0].mentioned_username || null,
      is_public: rows[0].is_public !== 0
    };

    return NextResponse.json({ 
      success: true, 
      data: comment 
    });
  } catch (err: any) {
    console.error("API /api/tasks/[id]/comments POST error:", err?.message, err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 },
    );
  }
}
