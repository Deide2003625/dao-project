import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const connection = await db();
    const [rows] = await connection.execute(`
      SELECT 
        d.*,
        t.team_code as team_nom,
        u.username as chef_nom
      FROM daos d
      LEFT JOIN teams t ON d.team_id = t.id
      LEFT JOIN users u ON d.chef_id = u.id
      WHERE d.id = ?
    `, [id]);

    if (!rows || (rows as any[]).length === 0) {
      return NextResponse.json(
        { message: "DAO non trouvé" },
        { status: 404 }
      );
    }

    const dao = (rows as any[])[0];
    
    // Calculer le statut basé sur la date de dépôt
    if (dao.date_depot) {
      const dateDepot = new Date(dao.date_depot);
      const today = new Date();
      const diffTime = today.getTime() - dateDepot.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Si déposé il y a 3 jours ou plus, statut = aRisque
      // Sinon, statut = enCours
      dao.statut = diffDays >= 3 ? 'aRisque' : 'enCours';
    } else {
      dao.statut = 'enCours'; // Par défaut si pas de date
    }

    return NextResponse.json(dao);
  } catch (err: any) {
    console.error("API /api/dao/[id] GET error:", err);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { statut } = await req.json();

    if (!statut) {
      return NextResponse.json(
        { message: "Statut requis" },
        { status: 400 }
      );
    }

    const connection = await db();
    await connection.execute(
      "UPDATE daos SET statut = ? WHERE id = ?",
      [statut, id]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API /api/dao/[id] PUT error:", err);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const connection = await db();
    
    // Supprimer les membres de l'équipe
    await connection.execute("DELETE FROM team_members WHERE team_id IN (SELECT team_id FROM daos WHERE id = ?)", [id]);
    
    // Supprimer l'équipe
    await connection.execute("DELETE FROM teams WHERE id IN (SELECT team_id FROM daos WHERE id = ?)", [id]);
    
    // Supprimer le DAO
    await connection.execute("DELETE FROM daos WHERE id = ?", [id]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("API /api/dao/[id] DELETE error:", err);
    return NextResponse.json(
      { message: "Erreur serveur" },
      { status: 500 }
    );
  }
}