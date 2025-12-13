import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { numero, date_depot, objet, description, reference, autorite, chefEquipe, membres } = body;

    if (!numero || !date_depot || !objet || !description || !reference || !autorite) {
      return NextResponse.json({ message: 'Champs requis manquants' }, { status: 400 });
    }

    const connection = await db();

    // Créer les tables si elles n'existent pas
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS teams (
        id VARCHAR(100) PRIMARY KEY,
        team_code VARCHAR(100) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS daos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        numero VARCHAR(100) UNIQUE,
        date_depot DATE,
        objet TEXT,
        description TEXT,
        reference VARCHAR(255),
        autorite VARCHAR(255),
        chef_id INT,
        team_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS team_members (
        team_id VARCHAR(100),
        user_id INT,
        PRIMARY KEY (team_id, user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Table pour suivre la séquence des DAO par année
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS dao_sequences (
        year INT PRIMARY KEY,
        seq INT NOT NULL DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Vérifier que le chef et les membres existent et ont les bons rôles
    const userIds = [] as number[];
    if (chefEquipe) userIds.push(Number(chefEquipe));
    if (Array.isArray(membres)) membres.forEach((m:any) => userIds.push(Number(m)));

    if (userIds.length === 0) {
      return NextResponse.json({ message: 'Chef et membres requis' }, { status: 400 });
    }

    const placeholders = userIds.map(() => '?').join(',');
    const [rows]: any = await connection.execute(`SELECT id, role_id, role FROM users WHERE id IN (${placeholders})`, userIds);

    // Map roles
    const idToRole: Record<number,string> = {};
    (rows || []).forEach((r:any) => { idToRole[r.id] = r.role || r.role_id; });

    // Chef must have chef role
    if (chefEquipe && !(idToRole[Number(chefEquipe)] && String(idToRole[Number(chefEquipe)]).toLowerCase().includes('chef'))) {
      return NextResponse.json({ message: 'Le chef d\'équipe sélectionné n\'a pas le rôle chef' }, { status: 400 });
    }

    // Members must have member role
    for (const m of membres || []) {
      const role = idToRole[Number(m)];
      const rl = String(role || '').toLowerCase();
      if (!(rl.includes('member') || rl.includes('membre') || rl.includes('team_member') || rl.includes('membre_equipe'))) {
        return NextResponse.json({ message: `L'utilisateur ${m} n\'a pas le rôle membre` }, { status: 400 });
      }
    }

    // Créer une équipe unique
    const teamId = crypto.randomUUID();
    const teamCode = `TEAM-${Date.now()}`;
    await connection.execute('INSERT INTO teams (id, team_code) VALUES (?, ?)', [teamId, teamCode]);

    // Générer le numéro DAO de manière atomique par année (DAO-YYYY-XXX)
    const year = new Date().getFullYear();
    // Essayer d'incrémenter la séquence pour l'année
    const [updateRes]: any = await connection.execute('UPDATE dao_sequences SET seq = seq + 1 WHERE year = ?', [year]);
    let seq = 1;
    if (updateRes.affectedRows === 0) {
      // Pas d'entrée pour l'année -> créer avec seq = 1
      await connection.execute('INSERT INTO dao_sequences (year, seq) VALUES (?, ?)', [year, 1]);
      seq = 1;
    } else {
      const [rows]: any = await connection.execute('SELECT seq FROM dao_sequences WHERE year = ?', [year]);
      seq = rows[0].seq;
    }

    const generatedNumero = `DAO-${year}-${String(seq).padStart(3, '0')}`;

    // Insérer DAO en utilisant le numéro généré côté serveur
    await connection.execute(
      'INSERT INTO daos (numero, date_depot, objet, description, reference, autorite, chef_id, team_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [generatedNumero, date_depot, objet, description, reference, autorite, Number(chefEquipe), teamId]
    );

    // Insérer membres
    for (const m of membres || []) {
      await connection.execute('INSERT INTO team_members (team_id, user_id) VALUES (?, ?)', [teamId, Number(m)]);
    }

    return NextResponse.json({ success: true, numero, teamId, teamCode });
  } catch (err:any) {
    console.error('API /api/dao error:', err);
    return NextResponse.json({ message: 'Erreur serveur lors de la création du DAO' }, { status: 500 });
  }
}
