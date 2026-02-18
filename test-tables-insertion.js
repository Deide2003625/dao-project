// Test pour vérifier la structure des tables et l'insertion
async function checkTablesAndInsertion() {
  try {
    console.log('=== VÉRIFICATION TABLES ET INSERTION ===');
    
    const connection = await require('mysql2/promise').createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'dao'
    });
    
    console.log('\n--- Étape 1: Vérification structure table daos ---');
    
    const [daosStructure] = await connection.execute('DESCRIBE daos');
    console.log('📊 Structure table daos:');
    daosStructure.forEach((column, index) => {
      console.log(`  ${index + 1}. ${column.Field} - ${column.Type} - ${column.Null} - ${column.Key}`);
    });
    
    console.log('\n--- Étape 2: Vérification structure table teams ---');
    
    try {
      const [teamsStructure] = await connection.execute('DESCRIBE teams');
      console.log('📊 Structure table teams:');
      teamsStructure.forEach((column, index) => {
        console.log(`  ${index + 1}. ${column.Field} - ${column.Type} - ${column.Null} - ${column.Key}`);
      });
    } catch (teamsError) {
      console.log('❌ Erreur structure teams:', teamsError.message);
    }
    
    console.log('\n--- Étape 3: Vérification structure table team_members ---');
    
    try {
      const [teamMembersStructure] = await connection.execute('DESCRIBE team_members');
      console.log('📊 Structure table team_members:');
      teamMembersStructure.forEach((column, index) => {
        console.log(`  ${index + 1}. ${column.Field} - ${column.Type} - ${column.Null} - ${column.Key}`);
      });
    } catch (teamMembersError) {
      console.log('❌ Erreur structure team_members:', teamMembersError.message);
    }
    
    console.log('\n--- Étape 4: Test d\'insertion manuelle ---');
    
    try {
      // Tester l'insertion manuelle d'un DAO
      const testInsertData = {
        numero: 'DAO-MANUAL-TEST-001',
        date_depot: '2026-02-20',
        objet: 'Test insertion manuelle',
        description: 'Test description',
        reference: 'MANUAL_TEST_' + Date.now(),
        autorite: 'Test autorité',
        statut: 'EN_COURS',
        chef_id: 47,
        team_id: 'test-team-id',
        groupement: null,
        nom_partenaire: null
      };
      
      console.log('Données insertion manuelle:');
      Object.keys(testInsertData).forEach(key => {
        console.log(`  ${key}: ${testInsertData[key]}`);
      });
      
      const [insertResult] = await connection.execute(`
        INSERT INTO daos (
          numero, date_depot, objet, description, reference, autorite, statut, 
          chef_id, team_id, groupement, nom_partenaire
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        testInsertData.numero,
        testInsertData.date_depot,
        testInsertData.objet,
        testInsertData.description,
        testInsertData.reference,
        testInsertData.autorite,
        testInsertData.statut,
        testInsertData.chef_id,
        testInsertData.team_id,
        testInsertData.groupement,
        testInsertData.nom_partenaire
      ]);
      
      console.log('✅ Insertion manuelle réussie:');
      console.log(`  Insert ID: ${insertResult.insertId}`);
      console.log(`  Affected rows: ${insertResult.affectedRows}`);
      
      // Vérifier que le DAO a bien été inséré
      const [verifyResult] = await connection.execute(`
        SELECT id, numero, chef_id FROM daos WHERE id = ?
      `, [insertResult.insertId]);
      
      if (verifyResult.length > 0) {
        console.log('✅ Vérification insertion:');
        console.log(`  ID: ${verifyResult[0].id}`);
        console.log(`  Numéro: ${verifyResult[0].numero}`);
        console.log(`  chef_id: ${verifyResult[0].chef_id}`);
        
        // Vérifier si le chef s'affiche dans l'API
        const apiResponse = await fetch("http://localhost:3000/api/dao", { cache: "no-store" });
        const apiData = await apiResponse.json();
        
        if (apiData.data) {
          const newDao = apiData.data.find(dao => dao.id === insertResult.insertId);
          if (newDao) {
            console.log('\n📊 Vérification API:');
            console.log(`  chef_id: ${newDao.chef_id || 'NULL'}`);
            console.log(`  chef_projet: ${newDao.chef_projet || 'NULL'}`);
            
            const hasChef = newDao.chef_projet && newDao.chef_projet !== 'N/A';
            console.log(`  Chef affiché: ${hasChef ? '✅' : '❌'}`);
            
            if (hasChef) {
              console.log('\n🎯 SOLUTION TROUVÉE !');
              console.log('L\'insertion manuelle fonctionne et le chef s\'affiche.');
              console.log('Le problème est dans l\'API POST Next.js.');
            }
          }
        }
      }
      
    } catch (insertError) {
      console.log('❌ Erreur insertion manuelle:', insertError.message);
    }
    
    await connection.end();
    
    console.log('\n--- Étape 5: Diagnostic final ---');
    
    console.log('🔍 Analyse des problèmes possibles:');
    console.log('1. Problème de structure de table (colonne manquante)');
    console.log('2. Problème de type de données (conversion)');
    console.log('3. Problème de contrainte (clé étrangère)');
    console.log('4. Problème dans la fonction getNextDaoNumero');
    console.log('5. Problème dans la création de team/team_members');
    
    console.log('\n🔧 Solutions recommandées:');
    console.log('1. Vérifier la structure de toutes les tables');
    console.log('2. Ajouter des logs détaillés dans l\'API POST');
    console.log('3. Tester chaque étape de l\'API POST séparément');
    console.log('4. Simplifier l\'API POST pour identifier le problème');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

checkTablesAndInsertion();
