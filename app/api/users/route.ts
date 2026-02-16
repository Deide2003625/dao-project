import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// Mapping des rôles
const ROLES = [
  { id: 1, name: "directeur", label: "Directeur Général" },
  { id: 2, name: "admin", label: "Administrateur" },
  { id: 3, name: "chef_projet", label: "Chef de Projet" },
  { id: 4, name: "membre_equipe", label: "Membre d'Équipe" },
  { id: 5, name: "lecteur", label: "Lecteur" },
];

function getRoleById(roleId: number) {
  return ROLES.find(role => role.id === roleId) || { id: roleId, name: "inconnu", label: "Rôle inconnu" };
}

export async function GET(request: NextRequest) {
  try {
    console.log("=== DÉBUT API USERS GET ===");
    const connection = await db();
    console.log("Connexion à la base établie");

    // Vérifier la structure de la table users
    const [tableStructure] = await connection.execute("DESCRIBE users");
    console.log("Structure de la table users:", JSON.stringify(tableStructure, null, 2));

    // Récupérer tous les utilisateurs avec tous les champs nécessaires
    const [users] = await connection.execute(
      `SELECT id, username, email, url_photo, role_id, password FROM users ORDER BY username ASC`
    ) as any[];
    console.log("Utilisateurs bruts de la base:", JSON.stringify(users, null, 2));
    console.log("Nombre d'utilisateurs trouvés:", Array.isArray(users) ? users.length : 0);

    // Normaliser les données pour correspondre à l'interface attendue
    const normalizedUsers = users.map((user: any) => {
      const role = getRoleById(user.role_id);
      return {
        id: user.id,
        username: user.username,
        name: user.username, // Ajouter le champ name pour compatibilité
        email: user.email,
        url_photo: user.url_photo,
        role_id: user.role_id,
        roleName: role.name, // Ajouter roleName
        roleLabel: role.label, // Ajouter roleLabel
      };
    });

    const response = {
      success: true,
      data: normalizedUsers
    };
    console.log("Réponse finale GET:", JSON.stringify(response, null, 2));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== DÉBUT API USERS POST ===");
    
    let body;
    try {
      const text = await request.text();
      console.log("Corps brut de la requête POST:", text);
      
      if (!text || text.trim() === '') {
        return NextResponse.json(
          {
            success: false,
            error: "Corps de requête vide",
          },
          { status: 400 },
        );
      }
      
      body = JSON.parse(text);
      console.log("Requête POST reçue avec le corps:", JSON.stringify(body, null, 2));
    } catch (jsonError) {
      console.error("Erreur de parsing JSON POST:", jsonError);
      return NextResponse.json(
        {
          success: false,
          error: "Format de requête invalide - JSON mal formé",
        },
        { status: 400 },
      );
    }

    const { username, email, role_id } = body;

    console.log("Données utilisateur:", { username, email, role_id });

    // Validation de base
    if (!username || !email || !role_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Tous les champs sont requis",
        },
        { status: 400 },
      );
    }

    const connection = await db();
    console.log("Connexion à la base établie pour POST");

    // Vérifier si l'email existe déjà
    const [existingUsers] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    ) as any[];

    if (existingUsers.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cet email est déjà utilisé",
        },
        { status: 400 },
      );
    }

    // Créer l'utilisateur SANS mot de passe (admin ne définit pas le mot de passe)
    const [result] = await connection.execute(
      "INSERT INTO users (username, email, role_id) VALUES (?, ?, ?)",
      [username, email, parseInt(role_id)]
    ) as any[];

    console.log("Utilisateur créé avec ID:", result.insertId);

    // Récupérer l'utilisateur créé
    const [newUsers] = await connection.execute(
      "SELECT id, username, email, url_photo, role_id, password FROM users WHERE id = ?",
      [result.insertId]
    ) as any[];

    const newUser = newUsers[0];
    const role = getRoleById(newUser.role_id);
    const normalizedUser = {
      id: newUser.id,
      username: newUser.username,
      name: newUser.username,
      email: newUser.email,
      url_photo: newUser.url_photo,
      role_id: newUser.role_id,
      roleName: role.name, // Ajouter roleName
      roleLabel: role.label, // Ajouter roleLabel
    };

    console.log("Utilisateur créé et normalisé:", normalizedUser);

    return NextResponse.json({
      success: true,
      user: normalizedUser,
      message: "Utilisateur créé avec succès"
    });

  } catch (error: any) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        {
          success: false,
          error: "Cet email est déjà utilisé",
        },
        { status: 400 },
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur: " + String(error),
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("=== DÉBUT API USERS PUT ===");
    
    let body;
    try {
      const text = await request.text();
      console.log("Corps brut de la requête PUT:", text);
      
      if (!text || text.trim() === '') {
        return NextResponse.json(
          {
            success: false,
            error: "Corps de requête vide",
          },
          { status: 400 },
        );
      }
      
      body = JSON.parse(text);
      console.log("Requête PUT reçue avec le corps:", JSON.stringify(body, null, 2));
    } catch (jsonError) {
      console.error("Erreur de parsing JSON PUT:", jsonError);
      return NextResponse.json(
        {
          success: false,
          error: "Format de requête invalide - JSON mal formé",
        },
        { status: 400 },
      );
    }

    const { username, email, role_id } = body;

    console.log("Données utilisateur PUT:", { username, email, role_id });

    // Validation de base
    if (!username || !email || !role_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Tous les champs sont requis",
        },
        { status: 400 },
      );
    }

    const connection = await db();
    console.log("Connexion à la base établie pour PUT");

    // Mettre à jour l'utilisateur
    const [result] = await connection.execute(
      "UPDATE users SET username = ?, email = ?, role_id = ? WHERE email = ?",
      [username, email, parseInt(role_id), email]
    ) as any[];

    console.log("Utilisateur mis à jour, rows affected:", result.affectedRows);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Utilisateur non trouvé",
        },
        { status: 404 },
      );
    }

    // Récupérer l'utilisateur mis à jour
    const [updatedUsers] = await connection.execute(
      "SELECT id, username, email, url_photo, role_id FROM users WHERE email = ?",
      [email]
    ) as any[];

    const updatedUser = updatedUsers[0];
    const role = getRoleById(updatedUser.role_id);
    const normalizedUser = {
      id: updatedUser.id,
      username: updatedUser.username,
      name: updatedUser.username,
      email: updatedUser.email,
      url_photo: updatedUser.url_photo,
      role_id: updatedUser.role_id,
      roleName: role.name, // Ajouter roleName
      roleLabel: role.label, // Ajouter roleLabel
    };

    console.log("Utilisateur mis à jour et normalisé:", normalizedUser);

    return NextResponse.json({
      success: true,
      user: normalizedUser,
      message: "Utilisateur mis à jour avec succès"
    });

  } catch (error: any) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur: " + String(error),
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("=== DÉBUT API USERS DELETE ===");
    
    const url = new URL(request.url);
    const userId = url.pathname.split('/').pop(); // Extraire l'ID de l'URL
    
    console.log("ID utilisateur à supprimer:", userId);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "ID utilisateur requis",
        },
        { status: 400 },
      );
    }

    const connection = await db();
    console.log("Connexion à la base établie pour DELETE");

    // Supprimer l'utilisateur
    const [result] = await connection.execute(
      "DELETE FROM users WHERE id = ?",
      [parseInt(userId)]
    ) as any[];

    console.log("Utilisateur supprimé, rows affected:", result.affectedRows);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Utilisateur non trouvé",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Utilisateur supprimé avec succès"
    });

  } catch (error: any) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur: " + String(error),
      },
      { status: 500 },
    );
  }
}
