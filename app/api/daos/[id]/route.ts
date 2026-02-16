import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET - Récupérer un DAO spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const daoId = await params.id;
    
    if (!daoId) {
      return NextResponse.json(
        { error: "ID de DAO requis" },
        { status: 400 }
      );
    }

    const connection = await db();
    
    const [daos] = await connection.execute(`
      SELECT 
        id,
        reference,
        numero,
        objet,
        description,
        statut,
        date_depot,
        chef_id,
        team_id,
        groupement,
        nom_partenaire,
        created_at,
        updated_at
      FROM daos 
      WHERE id = ?
    `, [daoId]);

    await connection.end();

    if ((daos as any[]).length === 0) {
      return NextResponse.json(
        { error: "DAO non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: (daos as any[])[0]
    });

  } catch (error) {
    console.error("Erreur lors de la récupération du DAO:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un DAO
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const daoId = await params.id;
    const body = await request.json();
    
    if (!daoId) {
      return NextResponse.json(
        { error: "ID de DAO requis" },
        { status: 400 }
      );
    }

    const connection = await db();
    
    // Construire la requête de mise à jour dynamique
    const updateFields = [];
    const updateValues = [];
    
    if (body.reference !== undefined) {
      updateFields.push("reference = ?");
      updateValues.push(body.reference);
    }
    if (body.numero !== undefined) {
      updateFields.push("numero = ?");
      updateValues.push(body.numero);
    }
    if (body.objet !== undefined) {
      updateFields.push("objet = ?");
      updateValues.push(body.objet);
    }
    if (body.description !== undefined) {
      updateFields.push("description = ?");
      updateValues.push(body.description);
    }
    if (body.statut !== undefined) {
      updateFields.push("statut = ?");
      updateValues.push(body.statut);
    }
    if (body.date_depot !== undefined) {
      updateFields.push("date_depot = ?");
      updateValues.push(body.date_depot);
    }
    if (body.chef_id !== undefined) {
      updateFields.push("chef_id = ?");
      updateValues.push(body.chef_id);
    }
    if (body.team_id !== undefined) {
      updateFields.push("team_id = ?");
      updateValues.push(body.team_id);
    }
    if (body.groupement !== undefined) {
      updateFields.push("groupement = ?");
      updateValues.push(body.groupement);
    }
    if (body.nom_partenaire !== undefined) {
      updateFields.push("nom_partenaire = ?");
      updateValues.push(body.nom_partenaire);
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "Aucun champ à mettre à jour" },
        { status: 400 }
      );
    }
    
    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    updateValues.push(daoId);
    
    const updateQuery = `
      UPDATE daos 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;
    
    await connection.execute(updateQuery, updateValues);
    await connection.end();

    return NextResponse.json({
      success: true,
      message: "DAO mis à jour avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du DAO:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un DAO
export async function DELETE(
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
    
    // Vérifier si le DAO existe
    const [daos] = await connection.execute(`
      SELECT id FROM daos WHERE id = ?
    `, [daoId]);
    
    if ((daos as any[]).length === 0) {
      await connection.end();
      return NextResponse.json(
        { error: "DAO non trouvé" },
        { status: 404 }
      );
    }
    
    // Supprimer le DAO (les tâches associées seront supprimées en cascade grâce à la contrainte FK)
    await connection.execute(`
      DELETE FROM daos WHERE id = ?
    `, [daoId]);
    
    await connection.end();

    return NextResponse.json({
      success: true,
      message: "DAO supprimé avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de la suppression du DAO:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
