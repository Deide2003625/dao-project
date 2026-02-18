// Test pour vérifier l'API DAO et l'affichage des chefs
async function testDaoApi() {
  try {
    console.log('=== TEST API DAO POUR AFFICHAGE CHEFS ===');
    
    console.log('\n--- Étape 1: Test API DAO ---');
    
    const daoRes = await fetch("http://localhost:3000/api/dao", { cache: "no-store" });
    console.log(`Status API DAO: ${daoRes.ok ? '✅' : '❌'} ${daoRes.status}`);
    
    if (!daoRes.ok) {
      const errorText = await daoRes.text();
      console.log(`❌ Erreur API: ${errorText.substring(0, 100)}...`);
      return;
    }
    
    const daoJson = await daoRes.json();
    console.log(`Structure réponse: ${daoJson.success ? '✅ success' : '❌ error'}`);
    console.log(`Nombre de DAOs: ${daoJson.data ? daoJson.data.length : 0}`);
    
    if (daoJson.data && daoJson.data.length > 0) {
      console.log('\n--- Étape 2: Analyse des DAOs ---');
      
      daoJson.data.forEach((dao, index) => {
        console.log(`\nDAO ${index + 1}:`);
        console.log(`  ID: ${dao.id}`);
        console.log(`  Numéro: ${dao.numero || 'N/A'}`);
        console.log(`  Référence: ${dao.reference || 'N/A'}`);
        console.log(`  Chef ID: ${dao.chef_id || 'N/A'}`);
        console.log(`  Chef projet: ${dao.chef_projet || 'N/A'}`);
        console.log(`  Statut: ${dao.statut || 'N/A'}`);
        console.log(`  Date dépôt: ${dao.date_depot || 'N/A'}`);
      });
      
      console.log('\n--- Étape 3: Vérification des chefs ---');
      
      const daosWithChefs = daoJson.data.filter(dao => dao.chef_projet && dao.chef_projet !== 'N/A');
      const daosWithoutChefs = daoJson.data.filter(dao => !dao.chef_projet || dao.chef_projet === 'N/A');
      
      console.log(`DAOs avec chef: ${daosWithChefs.length}`);
      console.log(`DAOs sans chef: ${daosWithoutChefs.length}`);
      
      if (daosWithoutChefs.length > 0) {
        console.log('\nDAOs sans chef:');
        daosWithoutChefs.forEach((dao, index) => {
          console.log(`  ${index + 1}. ID: ${dao.id}, Chef ID: ${dao.chef_id || 'N/A'}, Chef projet: ${dao.chef_projet || 'N/A'}`);
        });
      }
      
      if (daosWithChefs.length > 0) {
        console.log('\nDAOs avec chef:');
        daosWithChefs.forEach((dao, index) => {
          console.log(`  ${index + 1}. ID: ${dao.id}, Chef: ${dao.chef_projet}`);
        });
      }
    }
    
    console.log('\n--- Étape 4: Test de la base de données ---');
    
    const connection = await require('mysql2/promise').createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'dao'
    });
    
    // Vérifier la table daos
    const [daosRows] = await connection.execute('SELECT id, numero, reference, chef_id FROM daos LIMIT 5');
    console.log('\n📊 Données brutes table daos:');
    daosRows.forEach((row, index) => {
      console.log(`  ${index + 1}. ID: ${row.id}, Numéro: ${row.numero || 'N/A'}, Chef ID: ${row.chef_id || 'N/A'}`);
    });
    
    // Vérifier la table users
    const [usersRows] = await connection.execute('SELECT id, username FROM users WHERE id IN (SELECT DISTINCT chef_id FROM daos WHERE chef_id IS NOT NULL)');
    console.log('\n📊 Utilisateurs qui sont chefs:');
    usersRows.forEach((row, index) => {
      console.log(`  ${index + 1}. ID: ${row.id}, Username: ${row.username || 'N/A'}`);
    });
    
    // Vérifier le JOIN
    const [joinRows] = await connection.execute(`
      SELECT 
        d.id,
        d.numero,
        d.reference,
        d.chef_id,
        u.username as chef_projet
      FROM daos d
      LEFT JOIN users u ON d.chef_id = u.id
      LIMIT 5
    `);
    console.log('\n📊 Résultat du JOIN daos-users:');
    joinRows.forEach((row, index) => {
      console.log(`  ${index + 1}. DAO ID: ${row.id}, Chef ID: ${row.chef_id || 'N/A'}, Chef projet: ${row.chef_projet || 'N/A'}`);
    });
    
    await connection.end();
    
    console.log('\n=== RÉSULTAT FINAL ===');
    console.log('🎯 Diagnostic du problème d\'affichage des chefs:');
    console.log(`   API DAO: ${daoRes.ok ? '✅ Fonctionnelle' : '❌ Erreur'}`);
    console.log(`   DAOs récupérés: ${daoJson.data ? daoJson.data.length : 0}`);
    console.log(`   DAOs avec chef: ${daosWithChefs ? daosWithChefs.length : 0}`);
    console.log(`   DAOs sans chef: ${daosWithoutChefs ? daosWithoutChefs.length : 0}`);
    console.log('');
    console.log('🔧 Problèmes possibles:');
    console.log('   1. LEFT JOIN ne fonctionne pas correctement');
    console.log('   2. chef_id est NULL dans la base');
    console.log('   3. username est NULL dans la table users');
    console.log('   4. Problème de formatage dans l\'interface');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testDaoApi();
