import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const { currentPassword, newPassword } = await req.json();

    // ID utilisateur connecté
    const userId = 1;

    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'votre_db'
    });

    // Vérifier ancien mot de passe
    const [rows]: any = await db.execute(
      "SELECT password FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
    }

    const valid = await bcrypt.compare(currentPassword, rows[0].password);

    if (!valid) {
      return NextResponse.json({ message: "Mot de passe actuel incorrect" }, { status: 400 });
    }

    // Hash du nouveau mot de passe
    const hashed = await bcrypt.hash(newPassword, 10);

    // Mise à jour SQL
    await db.execute(
      "UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?",
      [hashed, userId]
    );

    db.end();

    return NextResponse.json({
      message: "Mot de passe mis à jour avec succès"
    });

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
