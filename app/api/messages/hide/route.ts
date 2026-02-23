import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();
    const { user_id, message_id } = body;

    if (!user_id || !message_id) {
      return NextResponse.json(
        { success: false, message: 'user_id et message_id sont requis' },
        { status: 400 }
      );
    }

    console.log('=== API HIDE MESSAGE ===');
    console.log('Masquer le message:', { user_id, message_id });

    // Connexion à la base de données
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'dao',
      port: 3306
    });

    // Créer la table hidden_messages si elle n'existe pas
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS hidden_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        message_id INT NOT NULL,
        hidden_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_message (user_id, message_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
      )
    `);

    // Insérer le message masqué
    await connection.execute(
      'INSERT IGNORE INTO hidden_messages (user_id, message_id) VALUES (?, ?)',
      [user_id, message_id]
    );

    await connection.end();

    console.log('✅ Message masqué pour l\'utilisateur');

    return NextResponse.json({
      success: true,
      message: 'Message masqué avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors du masquage du message:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erreur lors du masquage du message'
    }, { status: 500 });
  }
}
