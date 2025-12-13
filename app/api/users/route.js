import { db } from "@/lib/db";

export async function POST(request) {
  try {
    console.log('Requête POST reçue sur /api/users');
    
    // Vérifier le contenu de la requête
    const body = await request.text();
    console.log('Corps de la requête:', body);
    
    let data;
    try {
      data = JSON.parse(body);
    } catch (e) {
      console.error('Erreur de parsing JSON:', e);
      return new Response(
        JSON.stringify({ error: "Format de données invalide" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Extraire chaque champ individuellement
    const username = data.username;
    const email = data.email;
    const role_id = data.role_id || data.role; // Essayer les deux clés possibles
    
    console.log('Données extraites:', { username, email, role_id });
    
    // Validation des données
    if (!username || !email || !role_id) {
      console.error('Champs manquants:', { username, email, role_id });
      return new Response(
        JSON.stringify({ 
          error: "Tous les champs sont obligatoires",
          received: { username: !!username, email: !!email, role_id: !!role_id }
        }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const connection = await db();
    
    // Vérifier la structure de la table users
    try {
      const [columns] = await connection.execute("SHOW COLUMNS FROM users");
      console.log('Colonnes de la table users:', columns.map(c => c.Field).join(', '));
    } catch (err) {
      console.error('Erreur lors de la vérification de la structure de la table:', err);
    }
    
    // Vérifier si l'utilisateur existe déjà
    console.log('Vérification de l\'existence de l\'utilisateur avec email:', email);
    const [existingUser] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    console.log('Résultat de la recherche d\'utilisateur existant:', existingUser);
    
    // Vérifier si le rôle existe
    console.log('Vérification de l\'existence du rôle avec ID:', role_id);
    const [roleExists] = await connection.execute(
      "SELECT id FROM roles WHERE id = ?",
      [role_id]
    );
    
    if (roleExists.length === 0) {
      console.error('Le rôle spécifié n\'existe pas:', role_id);
      return new Response(
        JSON.stringify({ error: "Le rôle spécifié n'existe pas" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (existingUser.length > 0) {
      return new Response(
        JSON.stringify({ error: "Un utilisateur avec cet email existe déjà" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Créer l'utilisateur
    const [result] = await connection.execute(
      "INSERT INTO users (username, email, role_id) VALUES (?, ?, ?)",
      [username, email, role_id]
    );

    // Récupérer l'utilisateur créé avec les informations complètes
    const [newUser] = await connection.execute(
      `SELECT u.*, r.name as roleName 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
      [result.insertId]
    );

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: newUser[0].id,
          username: newUser[0].username,
          email: newUser[0].email,
          role: newUser[0].role_id,
          roleName: newUser[0].roleName,
          roleLabel: newUser[0].roleName // Utiliser roleName comme label par défaut
        }
      }), 
      { 
        status: 201, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0'
        } 
      }
    );

  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erreur serveur",
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        details: {
          name: error.name,
          code: error.code,
          sqlMessage: error.sqlMessage
        }
      }), 
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0'
        } 
      }
    );
  }
}

// Ajouter une route GET pour récupérer la liste des utilisateurs
export async function GET() {
  try {
    const connection = await db();
    
    // Récupérer les utilisateurs avec les informations de rôle
    const [users] = await connection.execute(`
      SELECT u.*, r.name as roleName 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id
    `);

    // Formater la réponse
    const formattedUsers = users.map(user => ({
      id: String(user.id),
      username: user.username,
      email: user.email,
      role: String(user.role_id),
      roleName: user.roleName,
      roleLabel: user.roleName,
      avatar: user.avatar
    }));

    return new Response(
      JSON.stringify(formattedUsers),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0'
        } 
      }
    );

  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erreur serveur",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
