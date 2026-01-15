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
      "SELECT id, dao_id, id_task, assigned_to FROM tasks WHERE dao_id = ?",
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

    await connection.execute(
      `INSERT INTO tasks (dao_id, id_task, description, assigned_to, progress, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [Number(dao_id), Number(id_task), description ?? null, Number(assigned_to), 0],
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API /api/task-assignment POST error:", err?.message, err);
    return NextResponse.json(
      { success: false, message: err?.message || "Erreur serveur" },
      { status: 500 },
    );
  }
}
