import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test simple sans dépendances
    console.log("🧪 [test] API test simple");
    
    return NextResponse.json({
      success: true,
      message: "API fonctionne",
      timestamp: new Date().toISOString(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_USER: process.env.DB_USER ? "***" : "missing",
        DB_PASSWORD: process.env.DB_PASSWORD ? "***" : "missing",
        DB_NAME: process.env.DB_NAME,
        BYPASS_DB: process.env.BYPASS_DB
      }
    });
  } catch (error) {
    console.error("❌ [test] Erreur:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Erreur inconnue" 
      },
      { status: 500 }
    );
  }
}
