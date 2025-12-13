import { db } from "@/lib/db";

export async function GET() {
  try {
    console.log('Début de la récupération des rôles...');
    
    // Obtenir une connexion à la base de données
    let connection;
    try {
      connection = await db();
      console.log('Connexion à la base de données établie avec succès');
    } catch (dbError) {
      console.error('Erreur de connexion à la base de données:', dbError);
      throw new Error('Impossible de se connecter à la base de données');
    }
    
    // Exécuter la requête
    let rows = [];
    try {
      console.log('Exécution de la requête SELECT...');
      [rows] = await connection.execute("SELECT id, name FROM roles");
      console.log('Résultats de la requête:', rows);
    } catch (queryError) {
      console.error('Erreur lors de l\'exécution de la requête:', {
        message: queryError.message,
        code: queryError.code,
        sql: queryError.sql,
        sqlState: queryError.sqlState,
        sqlMessage: queryError.sqlMessage
      });
      throw queryError;
    }
    
    // Formater la réponse pour inclure tous les champs nécessaires
    const formattedRoles = rows.map(role => ({
      id: String(role.id), // S'assurer que l'ID est une chaîne
      name: role.name,
      label: role.name // Utiliser le nom comme libellé par défaut
    }));

    console.log('Rôles formatés dans l\'API:', JSON.stringify(formattedRoles, null, 2));
    
    return new Response(JSON.stringify(formattedRoles), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0' // Désactiver le cache pour le débogage
      }
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des rôles:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      sql: error.sql,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    
    return new Response(JSON.stringify({ 
      error: "Erreur serveur",
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && {
        details: {
          stack: error.stack,
          code: error.code,
          sql: error.sql,
          sqlState: error.sqlState,
          sqlMessage: error.sqlMessage
        }
      })
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
  }
}
