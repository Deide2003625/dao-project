// Test pour vérifier si les noms existent vraiment
async function verifyChefNamesExist() {
  try {
    console.log('=== VÉRIFICATION SI LES NOMS EXISTENT ===');
    
    const connection = await require('mysql2/promise').createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'dao'
    });
    
    console.log('\n--- Étape 1: Vérification directe des chefs ---');
    
    // Prendre les chef_id uniques des DAOs
    const [chefIds] = await connection.execute(`
      SELECT DISTINCT chef_id FROM daos WHERE chef_id IS NOT NULL
    `);
    
    console.log('📊 Chef_id uniques trouvés:');
    chefIds.forEach((row, index) => {
      console.log(`  ${index + 1}. chef_id: ${row.chef_id}`);
    });
    
    console.log('\n--- Étape 2: Vérification des utilisateurs correspondants ---');
    
    // Vérifier si ces utilisateurs existent
    const chefIdValues = chefIds.map(row => row.chef_id);
    const [users] = await connection.execute(`
      SELECT id, username, role_id FROM users 
      WHERE id IN (${chefIdValues.map(() => '?').join(',')})
    `, chefIdValues);
    
    console.log('👥 Utilisateurs correspondants:');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ID: ${user.id}, Username: "${user.username}", Role: ${user.role_id}`);
    });
    
    console.log('\n--- Étape 3: Vérification du LEFT JOIN ---');
    
    // Tester le LEFT JOIN exactement comme l'API
    const [leftJoinResult] = await connection.execute(`
      SELECT 
        d.id,
        d.numero,
        d.chef_id,
        u.username as chef_projet,
        CASE WHEN u.id IS NULL THEN 'MANQUANT' ELSE 'TROUVÉ' END as join_status
      FROM daos d
      LEFT JOIN users u ON d.chef_id = u.id
      WHERE d.chef_id IS NOT NULL
      ORDER BY d.created_at DESC
      LIMIT 5
    `);
    
    console.log('📊 Résultat LEFT JOIN:');
    leftJoinResult.forEach((row, index) => {
      console.log(`  ${index + 1}. DAO ${row.numero}:`);
      console.log(`     chef_id: ${row.chef_id}`);
      console.log(`     chef_projet: "${row.chef_projet}"`);
      console.log(`     join_status: ${row.join_status}`);
      
      const shouldShowName = row.join_status === 'TROUVÉ';
      console.log(`     Devrait afficher: ${shouldShowName ? 'NOM' : 'ID'}`);
    });
    
    console.log('\n--- Étape 4: Test de l\'API réelle ---');
    
    // Voir ce que l'API retourne réellement
    const apiResponse = await fetch("http://localhost:3000/api/dao", { cache: "no-store" });
    const apiData = await apiResponse.json();
    
    if (apiData.data && apiData.data.length > 0) {
      console.log('📊 API réelle:');
      apiData.data.slice(0, 3).forEach((dao, index) => {
        console.log(`  ${index + 1}. DAO ${dao.numero}:`);
        console.log(`     chef_id: ${dao.chef_id}`);
        console.log(`     chef_projet: "${dao.chef_projet}"`);
        
        const hasName = dao.chef_projet && dao.chef_projet !== '' && dao.chef_projet !== null;
        console.log(`     A un nom: ${hasName ? '✅' : '❌'}`);
      });
    }
    
    await connection.end();
    
    console.log('\n--- Étape 5: Diagnostic ---');
    
    console.log('🔍 Si les noms existent en base mais pas dans l\'API:');
    console.log('1. Problème de cache de l\'API');
    console.log('2. L\'API utilise une ancienne version du code');
    console.log('3. Problème de type entre chef_id (bigint) et users.id (int)');
    console.log('4. Le LEFT JOIN est mal écrit dans l\'API');
    
    console.log('\n🔧 Solutions:');
    console.log('1. Redémarrer le serveur Next.js');
    console.log('2. Vider le cache de l\'API');
    console.log('3. Corriger les types des colonnes');
    console.log('4. Ajouter des logs dans l\'API');
    
    console.log('\n=== CONCLUSION ===');
    console.log('🎯 Si les noms existent en base:');
    console.log('- Le LEFT JOIN devrait fonctionner');
    console.log('- L\'API devrait retourner les noms');
    console.log('- Le tableau devrait afficher les noms');
    console.log('- Si ce n\'est pas le cas, c\'est un problème technique');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

verifyChefNamesExist();
