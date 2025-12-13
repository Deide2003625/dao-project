import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const image = formData.get('image') as File | null;

    // ID utilisateur (remplace par ton système d’auth)
    const userId = 1;

    // Connexion DB
    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'dao'
    });

    let photoUrl = null;

    // Si une image a été uploadée
    if (image) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Stockage local dans /public/uploads
      const uploadDir = path.join(process.cwd(), 'public/uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

      const filename = `user_${userId}_${Date.now()}.jpg`;
      const filepath = path.join(uploadDir, filename);

      fs.writeFileSync(filepath, buffer);

      photoUrl = `/uploads/${filename}`;
    }

    // Mise à jour SQL
    const [result] = await db.execute(
      `
        UPDATE users
        SET username = ?, email = ?, ${photoUrl ? "url_photo = ?," : ""}
            updated_at = NOW()
        WHERE id = ?
      `,
      photoUrl ? [name, email, photoUrl, userId] : [name, email, userId]
    );

    db.end();

    return NextResponse.json({
      success: true,
      message: "Profil mis à jour",
      photoUrl
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
