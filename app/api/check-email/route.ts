// app/api/check-email/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:2001",
  "https://gestdao.pprod.2snd.bj",
  process.env.NEXT_PUBLIC_APP_URL || "https://ton-domaine.com",
];

function getCorsHeaders(origin: string | null) {
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  };
}

export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  console.log("🔍 [check-email] Requête reçue:", { email, origin });

  if (!email) {
    return NextResponse.json(
      { success: false, error: "Email requis" },
      { status: 400, headers: getCorsHeaders(origin) }
    );
  }

  // Mode bypass pour test production (à supprimer après)
  if (process.env.NODE_ENV === "production" && process.env.BYPASS_DB === "true") {
    console.log("⚠️ [check-email] Mode bypass DB activé");
    return NextResponse.json(
      { success: email === "admin@dao.com", hasPassword: true },
      { headers: getCorsHeaders(origin) }
    );
  }

  // Vérification des variables d'environnement DB
  if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD) {
    console.error("❌ [check-email] Variables DB manquantes:", {
      DB_HOST: process.env.DB_HOST,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD ? "***" : "missing",
      DB_NAME: process.env.DB_NAME
    });
    return NextResponse.json(
      { success: false, error: "Configuration base de données manquante" },
      { status: 500, headers: getCorsHeaders(origin) }
    );
  }

  try {
    console.log("📊 [check-email] Connexion à la base de données...");
    const connection = await db();
    console.log("✅ [check-email] Connexion DB établie");

    interface UserRow extends RowDataPacket {
      id: number;
      password: string | null;
    }

    console.log("🔎 [check-email] Recherche utilisateur:", email);
    const [rows] = await connection.execute<UserRow[]>(
      "SELECT id, password FROM users WHERE email = ?",
      [email]
    );

    const userExists = Array.isArray(rows) && rows.length > 0;
    const hasPassword = userExists && rows[0].password !== null && rows[0].password !== "";

    console.log("📝 [check-email] Résultat:", { userExists, hasPassword });

    return NextResponse.json(
      { success: userExists, hasPassword },
      { headers: getCorsHeaders(origin) }
    );
  } catch (error: unknown) {
    console.error("❌ [check-email] Erreur:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500, headers: getCorsHeaders(origin) }
    );
  }
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}
