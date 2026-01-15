import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import * as yup from "yup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function ensureTables(connection: any) {
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
      chef_id BIGINT UNSIGNED,
      team_id VARCHAR(100),
      statut ENUM('aRisque', 'enCours') DEFAULT 'enCours',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Ajouter la colonne statut si elle n'existe pas
  try {
    await connection.execute(`
      ALTER TABLE daos ADD COLUMN statut ENUM('aRisque', 'enCours') DEFAULT 'enCours'
    `);
  } catch (err) {
    // Colonne existe déjà, ignorer l'erreur
  }

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS team_members (
      team_id VARCHAR(100),
      user_id BIGINT UNSIGNED,
      PRIMARY KEY (team_id, user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS dao_sequences (
      year INT PRIMARY KEY,
      seq INT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

/**
 * Génère un numéro DAO-YYYY-XXX de façon atomique (safe en concurrence)
 */
async function getNextDaoNumero(connection: any) {
  const year = new Date().getFullYear();

  // Atomique: insert si absent sinon incrémente, et on récupère la nouvelle valeur via LAST_INSERT_ID
  await connection.execute(
    `
    INSERT INTO dao_sequences (year, seq)
    VALUES (?, 1)
    ON DUPLICATE KEY UPDATE seq = LAST_INSERT_ID(seq + 1)
  `,
    [year],
  );

  const [seqRows]: any = await connection.execute(
    `SELECT LAST_INSERT_ID() AS seq`,
  );

  const seq = Number(seqRows?.[0]?.seq || 1);
  const generatedNumero = `DAO-${year}-${String(seq).padStart(3, "0")}`;

  return generatedNumero;
}

<<<<<<< HEAD
const createDaoSchema = yup.object().shape({
  date_depot: yup.date().required("Date de dépôt requise"),
  objet: yup.string().trim().min(1, "Objet requis").max(255, "Objet trop long"),
  description: yup.string().trim().min(1, "Description requise").max(1000, "Description trop longue"),
  reference: yup.string().trim().min(1, "Référence requise").max(255, "Référence trop longue"),
  autorite: yup.string().trim().min(1, "Autorité requise").max(255, "Autorité trop longue"),
  chefEquipe: yup.number().integer().positive("Chef d'équipe invalide").required("Chef d'équipe requis"),
  membres: yup.array().of(yup.number().integer().positive()).min(1, "Au moins un membre requis"),
});

export async function GET() {
=======
export async function GET(req: NextRequest) {
>>>>>>> feature/ModifAll
  try {
    const connection = await db();

    // crée les tables si besoin
    await ensureTables(connection);

    const { searchParams } = new URL(req.url);
    const chefId = searchParams.get("chefId");

    let query = `
      SELECT 
        d.id,
        d.numero,
        d.reference,
        d.autorite,
        d.date_depot,
        d.statut,
        d.chef_id,
        u.username as chef_projet
      FROM daos d
      LEFT JOIN users u ON d.chef_id = u.id
    `;

    const params: any[] = [];

    if (chefId) {
      query += " WHERE d.chef_id = ?";
      params.push(Number(chefId));
    }

    query += " ORDER BY d.created_at DESC";

    const [rows]: any = await connection.execute(query, params);

    // Calculer le statut pour chaque DAO basé sur la date de dépôt
    const daosWithStatus = rows.map((dao: any) => {
      if (dao.date_depot) {
        const dateDepot = new Date(dao.date_depot);
        const today = new Date();
        const diffTime = today.getTime() - dateDepot.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Si déposé il y a 3 jours ou plus, statut = aRisque
        // Sinon, statut = enCours
        dao.statut = diffDays >= 3 ? 'aRisque' : 'enCours';
      } else {
        dao.statut = 'enCours'; // Par défaut si pas de date
      }
      return dao;
    });

    return NextResponse.json({ success: true, data: daosWithStatus });
  } catch (err: any) {
    console.error("API /api/dao GET error:", err?.message, err);
    return NextResponse.json(
      { success: false, message: err?.message || "Erreur serveur" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validation des données d'entrée
    await createDaoSchema.validate(body, { abortEarly: false });

    const {
      date_depot,
      objet,
      description,
      reference,
      autorite,
      chefEquipe,
      membres,
    } = body;

    // numero n'est plus requis côté client (car généré côté serveur)
    if (!date_depot || !objet || !description || !reference || !autorite) {
      return NextResponse.json(
        { success: false, message: "Champs requis manquants" },
        { status: 400 },
      );
    }

    const connection = await db();

    // crée les tables si besoin
    await ensureTables(connection);

    // Vérifier que le chef et les membres existent et ont les bons rôles
    const userIds: number[] = [];
    if (chefEquipe) userIds.push(Number(chefEquipe));
    if (Array.isArray(membres)) membres.forEach((m: any) => userIds.push(Number(m)));

    if (userIds.length === 0) {
      return NextResponse.json(
        { success: false, message: "Chef et membres requis" },
        { status: 400 },
      );
    }

    const placeholders = userIds.map(() => "?").join(",");
    const [usersRows]: any = await connection.execute(
      `SELECT id, role_id FROM users WHERE id IN (${placeholders})`,
      userIds,
    );

    const idToRole: Record<number, string> = {};
    (usersRows || []).forEach((r: any) => {
      idToRole[Number(r.id)] = String(r.role_id);
    });

    // Vérification du rôle ChefProjet supprimée pour permettre à n'importe quel utilisateur d'être chef d'équipe

    // Members must have member role (role_id 4 = MembreEquipe)
    for (const m of membres || []) {
      if (String(idToRole[Number(m)]) !== "4") {
        return NextResponse.json(
          { success: false, message: `L'utilisateur ${m} n'a pas le rôle MembreEquipe` },
          { status: 400 },
        );
      }
    }

    // Créer une équipe unique
    const teamId = crypto.randomUUID();
    const teamCode = `TEAM-${Date.now()}`;

    await connection.execute(
      "INSERT INTO teams (id, team_code) VALUES (?, ?)",
      [teamId, teamCode],
    );

    // Générer le numéro DAO côté serveur (atomique)
    const generatedNumero = await getNextDaoNumero(connection);

    // Insérer DAO
    const [insertRes]: any = await connection.execute(
      `
      INSERT INTO daos (numero, date_depot, objet, description, reference, autorite, statut, chef_id, team_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        generatedNumero,
        date_depot,
        objet,
        description,
        reference,
        autorite,
        'EN_COURS',
        Number(chefEquipe),
        teamId,
      ],
    );

    const daoId = insertRes?.insertId;

    // Insérer membres
    for (const m of membres || []) {
      await connection.execute(
        "INSERT INTO team_members (team_id, user_id) VALUES (?, ?)",
        [teamId, Number(m)],
      );
    }

    return NextResponse.json({
      success: true,
      id: daoId,
      numero: generatedNumero,
      teamId,
      teamCode,
    });
  } catch (err: any) {
    console.error("API /api/dao POST error:", err?.message, err);
    return NextResponse.json(
      { success: false, message: "Erreur serveur lors de la création du DAO" },
      { status: 500 },
    );
  }
}
