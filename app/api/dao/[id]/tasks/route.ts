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
        t.id,
        t.dao_id,
        t.titre,
        t.description,
        t.statut,
        t.date_creation,
        t.date_echeance,
        t.priorite,
        t.assigned_to,
        u.username AS assigned_username
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.dao_id = ?
      ORDER BY t.created_at DESC
    `,
      [id],
    );

    return NextResponse.json({ success: true, data: rows || [] });
  } catch (err: any) {
    console.error("API /api/dao/[id]/tasks GET error:", err?.message, err);
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
    const {
      titre,
      description,
      statut,
      date_creation,
      date_echeance,
      priorite,
      assigned_to,
    } = body || {};

    if (!titre) {
      return NextResponse.json(
        { success: false, message: "Titre requis" },
        { status: 400 },
      );
    }

    const connection = await db();
    await ensureTaskTables(connection);

    const safeDateCreation =
      date_creation || new Date().toISOString().slice(0, 10);

    const [insertRes]: any = await connection.execute(
      `
      INSERT INTO tasks
        (dao_id, titre, description, statut, date_creation, date_echeance, priorite, assigned_to)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        Number(id),
        titre,
        description ?? null,
        statut ?? "a_faire",
        safeDateCreation,
        date_echeance ?? null,
        priorite ?? "moyenne",
        assigned_to ?? null,
      ],
    );

    return NextResponse.json({ success: true, id: insertRes?.insertId });
  } catch (err: any) {
    console.error("API /api/dao/[id]/tasks POST error:", err?.message, err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 },
    );
  }
}
