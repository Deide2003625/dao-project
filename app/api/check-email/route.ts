import { NextResponse } from "next/server";
import { db } from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ 
      success: false, 
      error: "Email requis" 
    }, { status: 400 });
  }

  try {
    const connection = await db();
    // Définition du type pour les lignes retournées
    interface UserRow extends RowDataPacket {
      id: number;
      password: string;
    }

    const [rows] = await connection.execute<UserRow[]>(
      'SELECT id, password FROM users WHERE email = ?',
      [email]
    );

    const userExists = Array.isArray(rows) && rows.length > 0;
    
    return NextResponse.json({
      success: userExists,
      password: userExists ? rows[0].password : null,
    });

  }   catch (error: unknown) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    
    let errorMessage = "Erreur serveur";
    let errorDetails: string | undefined;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = process.env.NODE_ENV === 'development' ? error.stack : undefined;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: errorDetails
      }, 
      { status: 500 }
    );
  
  }
}