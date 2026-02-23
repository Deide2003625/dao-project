import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET(request: Request) {
  // Handle OPTIONS method for CORS preflight
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Diagnostic de la requête entrante
  console.log("=== DIAGNOSTIC CHECK-EMAIL API ===");
  console.log("URL complète:", request.url);
  console.log("Méthode:", request.method);
  
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  
  console.log("Paramètres URL complets:", Object.fromEntries(searchParams.entries()));
  console.log("Email extrait:", email);
  console.log("Type de l'email:", typeof email);
  console.log("Email vide?", !email);
  console.log("=====================================");

  if (!email) {
    console.log(" ERREUR 400: Email requis");
    return NextResponse.json(
      {
        success: false,
        error: "Email requis",
        debug: {
          url: request.url,
          hasEmailParam: searchParams.has("email"),
          emailValue: email,
          allParams: Object.fromEntries(searchParams.entries())
        }
      },
      {
        status: 400,
        headers: corsHeaders,
      },
    );
  }

  try {
    const connection = await db();
    // Définition du type pour les lignes retournées
    interface UserRow extends RowDataPacket {
      id: number;
      password: string;
    }

    const [rows] = await connection.execute<UserRow[]>(
      "SELECT id, password FROM users WHERE email = ?",
      [email],
    );

    const userExists = Array.isArray(rows) && rows.length > 0;

    return NextResponse.json(
      {
        success: userExists,
        password: userExists ? rows[0].password : null,
      },
      {
        headers: corsHeaders,
      },
    );
  } catch (error: unknown) {
    console.error("Erreur lors de la vérification de l'email:", error);

    let errorMessage = "Erreur serveur";
    let errorDetails: string | undefined;

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails =
        process.env.NODE_ENV === "development" ? error.stack : undefined;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        ...(errorDetails && { details: errorDetails }),
      },
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}
