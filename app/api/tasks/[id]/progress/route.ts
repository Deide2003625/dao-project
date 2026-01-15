import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  console.log('=== DÉBUT API PUT /api/tasks/[id]/progress ===');
  
  // Afficher les informations de la requête
  const url = new URL(req.url);
  console.log('URL complète:', req.url);
  console.log('Chemin:', url.pathname);
  console.log('Paramètres de recherche:', url.searchParams.toString());
  console.log('Méthode:', req.method);
  console.log('En-têtes:', Object.fromEntries(req.headers.entries()));
  
  // Extraire l'ID des paramètres de la route ou de l'URL
  let id = params?.id;
  
  // Si l'ID n'est pas dans les paramètres, essayons de l'extraire de l'URL
  if (!id) {
    const pathParts = new URL(req.url).pathname.split('/').filter(Boolean);
    id = pathParts[pathParts.length - 2]; // L'ID est l'avant-dernier segment de l'URL
    console.log('ID extrait de l\'URL:', id);
  }
  
  console.log('Paramètres de la route (params):', params);
  console.log('ID extrait:', id);
  console.log(`Type de l'ID: ${typeof id}, Valeur: ${id}`);
  
  // Vérifier que l'ID est valide
  if (!id || id === 'undefined' || id === 'null' || id === '0') {
    const errorMsg = `ID de tâche manquant ou invalide dans l'URL: ${id}`;
    console.error(errorMsg);
    console.log('Headers de la requête:', Object.fromEntries(req.headers.entries()));
    console.log('URL complète:', req.url);
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMsg,
        receivedId: id,
        params: params,
        url: req.url
      },
      { status: 400 },
    );
  }
  
  try {
    const body = await req.json().catch((error) => {
      console.error('Erreur lors de l\'analyse du corps de la requête:', error);
      throw new Error('Corps de la requête invalide');
    });
    
    const { progress } = body;
    console.log("Données reçues:", { id, progress });

    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      const errorMsg = `Progression invalide: ${progress}`;
      console.error(errorMsg);
      return NextResponse.json(
        { success: false, message: errorMsg },
        { status: 400 },
      );
    }

    console.log("Connexion à la base de données...");
    const connection = await db();
    
    try {
      // Vérifier d'abord si la tâche existe
      console.log(`Vérification de l'existence de la tâche ${id}...`);
      const [taskRows] = await connection.query(
        "SELECT id FROM tasks WHERE id = ?",
        [id]
      );
      
      if (!Array.isArray(taskRows) || taskRows.length === 0) {
        const errorMsg = `Tâche non trouvée avec l'ID: ${id}`;
        console.error(errorMsg);
        return NextResponse.json(
          { success: false, message: errorMsg },
          { status: 404 },
        );
      }

      console.log(`Mise à jour de la progression à ${progress}% pour la tâche ${id}...`);
      
      // Mettre à jour la progression dans la table tasks
      const [result] = await connection.execute(
        "UPDATE tasks SET progress = ? WHERE id = ?",
        [progress, id],
      );

      console.log("Résultat de la mise à jour:", result);

      // Vérifier si la mise à jour a réussi
      if ('affectedRows' in result && result.affectedRows === 0) {
        const errorMsg = `Aucune ligne mise à jour pour la tâche ${id}`;
        console.error(errorMsg);
        return NextResponse.json(
          { success: false, message: errorMsg },
          { status: 404 },
        );
      }

      console.log("Progression mise à jour avec succès");
      return NextResponse.json({ 
        success: true, 
        data: { progress } 
      });
      
    } catch (dbError) {
      console.error("Erreur de base de données:", dbError);
      return NextResponse.json(
        { 
          success: false, 
          message: "Erreur de base de données",
          error: String(dbError)
        },
        { status: 500 },
      );
    }
  } catch (err) {
    const error = err as Error;
    console.error("Erreur lors de la mise à jour de la progression:", error.message, error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Erreur serveur",
        error: error.message 
      },
      { status: 500 },
    );
  }
}