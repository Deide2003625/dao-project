import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const daoId = searchParams.get("daoId");

    if (!daoId) {
      return NextResponse.json(
        { success: false, message: "daoId requis" },
        { status: 400 },
      );
    }

    const connection = await db();
    const [rows]: any = await connection.execute(
      "SELECT id, dao_id, id_task, titre, description, assigned_to FROM tasks WHERE dao_id = ?",
      [Number(daoId)],
    );

    return NextResponse.json({ success: true, data: rows || [] });
  } catch (err: any) {
    console.error("API /api/task-assignment GET error:", err?.message, err);
    return NextResponse.json(
      { success: false, message: err?.message || "Erreur serveur" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dao_id, id_task, assigned_to, description } = body || {};

    if (!dao_id || !id_task || !assigned_to) {
      return NextResponse.json(
        { success: false, message: "dao_id, id_task et assigned_to sont requis" },
        { status: 400 },
      );
    }

    const connection = await db();

    // Vérifier si une tâche existe déjà pour ce DAO et ce modèle
    const [existingTasks]: any = await connection.execute(
      "SELECT id FROM tasks WHERE dao_id = ? AND id_task = ?",
      [Number(dao_id), Number(id_task)],
    );

    if (existingTasks.length > 0) {
      // Mettre à jour la tâche existante
      await connection.execute(
        "UPDATE tasks SET assigned_to = ?, updated_at = NOW() WHERE dao_id = ? AND id_task = ?",
        [Number(assigned_to), Number(dao_id), Number(id_task)],
      );
      console.log(`Tâche existante mise à jour: dao_id=${dao_id}, id_task=${id_task}, assigned_to=${assigned_to}`);
    } else {
      // Créer une nouvelle tâche seulement si elle n'existe pas
      const [taskRows]: any = await connection.execute(
        "SELECT nom FROM task WHERE id = ?",
        [Number(id_task)],
      );

      const taskName = taskRows.length > 0 ? taskRows[0].nom : `Tâche ${id_task}`;

      await connection.execute(
        `INSERT INTO tasks (dao_id, id_task, titre, description, assigned_to, progress, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [Number(dao_id), Number(id_task), taskName, description ?? null, Number(assigned_to), 0],
      );
      console.log(`Nouvelle tâche créée: dao_id=${dao_id}, id_task=${id_task}, assigned_to=${assigned_to}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API /api/task-assignment POST error:", err?.message, err);
    return NextResponse.json(
      { success: false, message: err?.message || "Erreur serveur" },
      { status: 500 },
    );
  }
}
