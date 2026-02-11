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
    CREATE TABLE IF NOT EXISTS task_comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      task_id INT NOT NULL,
      user_id BIGINT UNSIGNED NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_task_comments_task (task_id),
      INDEX idx_task_comments_user (user_id),
      CONSTRAINT fk_task_comments_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      CONSTRAINT fk_task_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const connection = await db();
    await ensureTaskTables(connection);

    const [rows]: any = await connection.execute(
      `
      SELECT
        c.id,
        c.text,
        c.created_at,
        c.user_id,
        u.username,
        u.role_id
      FROM task_comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.task_id = ?
      ORDER BY c.created_at DESC
    `,
      [id],
    );

    const data = (rows || []).map((row: any) => ({
      id: row.id,
      text: row.text,
      created_at: row.created_at,
      user_id: row.user_id,
      user: row.username || "Utilisateur",
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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { text, user_id } = body || {};

    if (!text || !user_id) {
      return NextResponse.json(
        { success: false, message: "Texte et utilisateur requis" },
        { status: 400 },
      );
    }

    const connection = await db();
    await ensureTaskTables(connection);

    const [insertRes]: any = await connection.execute(
      `INSERT INTO task_comments (task_id, user_id, text) VALUES (?, ?, ?)`,
      [Number(id), Number(user_id), text],
    );

    return NextResponse.json({ success: true, id: insertRes?.insertId });
  } catch (err: any) {
    console.error("API /api/tasks/[id]/comments POST error:", err?.message, err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 },
    );
  }
}
