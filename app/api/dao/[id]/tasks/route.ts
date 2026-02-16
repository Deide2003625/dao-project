import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function ensureTaskTables(connection: any) {
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      dao_id INT NOT NULL,
      id_task INT NOT NULL,
      titre VARCHAR(255) DEFAULT NULL,
      description TEXT DEFAULT NULL,
      statut ENUM('a_faire', 'en_cours', 'termine') DEFAULT 'a_faire',
      progress INT DEFAULT 0,
      date_creation DATE DEFAULT NULL,
      date_echeance DATE DEFAULT NULL,
      priorite ENUM('basse', 'moyenne', 'haute') DEFAULT 'moyenne',
      assigned_to INT DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_tasks_dao (dao_id),
      INDEX idx_tasks_assigned (assigned_to),
      INDEX idx_tasks_progress (progress),
      INDEX idx_tasks_statut (statut),
      FOREIGN KEY (dao_id) REFERENCES daos(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

// GET - Récupérer les tâches d'un DAO spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const daoId = params.id;
    
    if (!daoId) {
      return NextResponse.json(
        { error: "ID de DAO requis" },
        { status: 400 }
      );
    }

    const connection = await db();
    await ensureTaskTables(connection);

    const [tasks] = await connection.execute(`
      SELECT
        t.id,
        t.dao_id,
        t.id_task,
        t.titre,
        t.description,
        t.statut,
        t.progress,
        t.date_creation,
        t.date_echeance,
        t.priorite,
        t.assigned_to,
        u.username as assigned_username
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.dao_id = ?
      ORDER BY t.id_task ASC
    `, [daoId]);

    await connection.end();

    return NextResponse.json({
      success: true,
      data: tasks
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des tâches:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une tâche
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const body = await request.json();
    const { titre, description, statut, progress, date_echeance, priorite, assigned_to } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: "ID de tâche requis" },
        { status: 400 }
      );
    }

    const connection = await db();
    await ensureTaskTables(connection);

    // Construire la requête de mise à jour dynamique
    const updateFields = [];
    const updateValues = [];
    
    if (titre !== undefined) {
      updateFields.push("titre = ?");
      updateValues.push(titre);
    }
    if (description !== undefined) {
      updateFields.push("description = ?");
      updateValues.push(description);
    }
    if (statut !== undefined) {
      updateFields.push("statut = ?");
      updateValues.push(statut);
    }
    if (progress !== undefined) {
      updateFields.push("progress = ?");
      updateValues.push(progress);
    }
    if (date_echeance !== undefined) {
      updateFields.push("date_echeance = ?");
      updateValues.push(date_echeance);
    }
    if (priorite !== undefined) {
      updateFields.push("priorite = ?");
      updateValues.push(priorite);
    }
    if (assigned_to !== undefined) {
      updateFields.push("assigned_to = ?");
      updateValues.push(assigned_to);
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "Aucun champ à mettre à jour" },
        { status: 400 }
      );
    }
    
    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    updateValues.push(taskId);
    
    const updateQuery = `
      UPDATE tasks 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;
    
    await connection.execute(updateQuery, updateValues);
    await connection.end();

    return NextResponse.json({
      success: true,
      message: "Tâche mise à jour avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour de la tâche:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une tâche
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    
    if (!taskId) {
      return NextResponse.json(
        { error: "ID de tâche requis" },
        { status: 400 }
      );
    }

    const connection = await db();
    await ensureTaskTables(connection);

    await connection.execute(`
      DELETE FROM tasks WHERE id = ?
    `, [taskId]);

    await connection.end();

    return NextResponse.json({
      success: true,
      message: "Tâche supprimée avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de la suppression de la tâche:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
