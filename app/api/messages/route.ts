import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task_id, user_id, content, mentioned_user_id, mentioned_user_name, is_public } = body;

    console.log('=== API MESSAGES - POST ===');
    console.log('Données reçues:', { task_id, user_id, content, mentioned_user_id, mentioned_user_name, is_public });

    // Validation des données requises
    if (!task_id || !user_id || !content) {
      return NextResponse.json(
        { success: false, message: 'task_id, user_id et content sont requis' },
        { status: 400 }
      );
    }

    // Connexion à la base de données
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'dao',
      port: parseInt(process.env.DB_PORT || '3306')
    });

    // Insérer le message dans la table messages
    const [result] = await connection.execute(`
      INSERT INTO messages (task_id, user_id, content, mentioned_user_id, mentioned_user_name, is_public)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [task_id, user_id, content, mentioned_user_id || null, mentioned_user_name || null, is_public !== false]);

    await connection.end();

    console.log('✅ Message inséré avec succès, ID:', (result as any).insertId);

    return NextResponse.json({
      success: true,
      message: 'Message ajouté avec succès',
      data: {
        id: (result as any).insertId,
        task_id,
        user_id,
        content,
        mentioned_user_id,
        mentioned_user_name,
        is_public: is_public !== false,
        created_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout du message:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de l\'ajout du message', error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const task_id = searchParams.get('task_id');
    const user_id = searchParams.get('user_id');

    console.log('=== API MESSAGES - GET ===');
    console.log('Paramètres:', { task_id, user_id });

    // Connexion à la base de données
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'dao',
      port: parseInt(process.env.DB_PORT || '3306')
    });

    // Créer la table hidden_messages si elle n'existe pas
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS hidden_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        message_id INT NOT NULL,
        hidden_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_message (user_id, message_id)
      )
    `);

    let query = `
      SELECT m.*, u.username as user_name
      FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
    `;
    let params: any[] = [];

    if (task_id) {
      query += ' WHERE m.task_id = ?';
      params.push(task_id);
    } else if (user_id) {
      // Pour le header : exclure les messages de l'utilisateur lui-même
      // Inclure seulement les messages publics OU les messages privés destinés à l'utilisateur
      // Exclure également les messages masqués par l'utilisateur
      query += `
        WHERE m.user_id != ? 
        AND (m.is_public = 1 OR m.mentioned_user_id = ?)
        AND m.id NOT IN (
          SELECT hm.message_id 
          FROM hidden_messages hm 
          WHERE hm.user_id = ?
        )
      `;
      params.push(user_id, user_id, user_id);
    }

    query += ' ORDER BY m.created_at DESC';

    const [messages] = await connection.execute(query, params);
    await connection.end();

    console.log(`✅ ${(messages as any[]).length} messages récupérés`);

    return NextResponse.json({
      success: true,
      message: 'Messages récupérés avec succès',
      data: messages
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des messages:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur lors de la récupération des messages', error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
