// Vérification des chefs manquants dans la base de données
const mysql = require('mysql2/promise');

async function checkMissingChefs() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'dao'
    });
    
    console.log('=== VÉRIFICATION CHEFS MANQUANTS ===');
    
    // Vérifier les DAOs avec des chef_id qui n'existent pas
    const [missingChefs] = await conn.execute(`
      SELECT 
        d.id,
        d.numero,
        d.chef_id,
        u.username as chef_projet,
        CASE WHEN u.id IS NULL THEN 'UTILISATEUR MANQUANT' ELSE 'TROUVÉ' END as status
      FROM daos d
      LEFT JOIN users u ON d.chef_id = u.id
      ORDER BY d.created_at DESC
      LIMIT 10
    `);
    
    console.log('\n📊 DAOs et leurs chefs:');
    missingChefs.forEach((row, index) => {
      console.log(`${index + 1}. DAO ${row.numero} (ID: ${row.id})`);
      console.log(`   chef_id: ${row.chef_id || 'NULL'}`);
      console.log(`   chef_projet: ${row.chef_projet || 'NULL'}`);
      console.log(`   status: ${row.status}`);
      console.log(`   Affichera: '${row.chef_projet || "N/A"}'`);
    });
    
    // Compter les problèmes
    const [countMissing] = await conn.execute(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN u.id IS NULL THEN 1 END) as missing_chef,
        COUNT(CASE WHEN u.id IS NOT NULL THEN 1 END) as found_chef
      FROM daos d
      LEFT JOIN users u ON d.chef_id = u.id
    `);
    
    console.log(`\n📈 Statistiques:`);
    console.log(`   Total DAOs: ${countMissing[0].total}`);
    console.log(`   Chefs manquants: ${countMissing[0].missing_chef}`);
    console.log(`   Chefs trouvés: ${countMissing[0].found_chef}`);
    console.log(`   Taux de succès: ${Math.round((countMissing[0].found_chef / countMissing[0].total) * 100)}%`);
    
    // Voir les chef_id uniques qui posent problème
    const [problemChefs] = await conn.execute(`
      SELECT DISTINCT d.chef_id
      FROM daos d
      LEFT JOIN users u ON d.chef_id = u.id
      WHERE u.id IS NULL AND d.chef_id IS NOT NULL
    `);
    
    if (problemChefs.length > 0) {
      console.log(`\n❌ Chef_id problématiques:`);
      problemChefs.forEach((row, index) => {
        console.log(`   ${index + 1}. chef_id: ${row.chef_id} (n'existe pas dans users)`);
      });
    }
    
    await conn.end();
    
    console.log('\n🎯 CONCLUSION:');
    console.log('Si des chefs manquent, le LEFT JOIN retourne NULL');
    console.log('Le tableau affichera "N/A" au lieu du nom du chef');
    
    if (countMissing[0].missing_chef > 0) {
      console.log('\n❌ PROBLÈME IDENTIFIÉ:');
      console.log(`${countMissing[0].missing_chef} DAOs ont des chef_id invalides`);
      console.log('Solution: Corriger les chef_id ou créer les utilisateurs manquants');
    } else {
      console.log('\n✅ TOUS LES CHEFS SONT VALIDES');
      console.log('Le problème vient probablement du composant React ou du cache');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkMissingChefs();
