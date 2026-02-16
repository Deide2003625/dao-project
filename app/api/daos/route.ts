import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    console.log("Début de la requête GET /api/daos");
    
    const dbPool = await db();
    console.log("Connexion à la base de données établie");

    // Vérification de l'existence des tables
    const [tables] = await dbPool.query("SHOW TABLES LIKE 'daos'");
    console.log("Tables trouvées:", tables);

    if (Array.isArray(tables) && tables.length === 0) {
      console.error("Erreur: La table 'daos' n'existe pas");
      return NextResponse.json(
        { success: false, message: "Table 'daos' non trouvée" },
        { status: 500 }
      );
    }

    // Vérification de la structure de la table
    const [columns] = await dbPool.query("SHOW COLUMNS FROM daos");
    console.log("Colonnes de la table daos:", columns);

    // Construire la requête en fonction des colonnes existantes
    const columnNames = Array.isArray(columns) ? columns.map((col: any) => col.Field) : [];
    console.log("Noms des colonnes:", columnNames);

    // Colonnes de base qui doivent exister
    const baseColumns = ['id', 'reference', 'objet', 'statut'];
    const optionalColumns = ['autorite', 'date_depot', 'created_at', 'numero', 'description', 'chef_id', 'team_id', 'groupement', 'nom_partenaire'];
    
    // Vérifier quelles colonnes optionnelles existent
    const availableOptionalColumns = optionalColumns.filter(col => columnNames.includes(col));
    const allColumns = [...baseColumns, ...availableOptionalColumns];
    
    console.log("Colonnes à sélectionner:", allColumns);

    // Requête principale pour récupérer tous les DAO
    console.log("Exécution de la requête principale...");
    const query = `
      SELECT ${allColumns.join(', ')}
      FROM daos
      ORDER BY created_at DESC
    `;
    
    console.log("Exécution de la requête:", query);
    
    const [daoRows] = await dbPool.query(query);
    
    console.log("Résultat de la requête des DAO:", JSON.stringify(daoRows, null, 2));
    console.log(`DAO trouvés: ${Array.isArray(daoRows) ? daoRows.length : '0'}`);

    return NextResponse.json({ 
      success: true, 
      data: daoRows 
    });
  } catch (error: any) {
    console.error("Erreur serveur:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur", error: error.message },
      { status: 500 }
    );
  }
}
