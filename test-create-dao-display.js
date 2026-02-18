// Test pour diagnostiquer pourquoi chef_projet ne se remplit pas après création
async function testCreateDaoAndDisplay() {
  try {
    console.log('=== TEST CRÉATION DAO ET AFFICHAGE CHEF ===');
    
    console.log('\n--- Étape 1: État actuel des DAOs ---');
    
    const beforeResponse = await fetch("http://localhost:3000/api/dao", { cache: "no-store" });
    const beforeData = await beforeResponse.json();
    const beforeCount = beforeData.data ? beforeData.data.length : 0;
    console.log(`DAOs avant création: ${beforeCount}`);
    
    if (beforeData.data && beforeData.data.length > 0) {
      console.log('Dernier DAO avant création:');
      const lastDao = beforeData.data[0];
      console.log(`  ID: ${lastDao.id}`);
      console.log(`  Numéro: ${lastDao.numero}`);
      console.log(`  chef_id: ${lastDao.chef_id || 'NULL'}`);
      console.log(`  chef_projet: ${lastDao.chef_projet || 'NULL'}`);
    }
    
    console.log('\n--- Étape 2: Création d\'un nouveau DAO ---');
    
    // Données pour créer un DAO avec un chef
    const newDaoData = {
      reference: "TEST_DAO_" + Date.now(),
      numero: "DAO-TEST-CHEF-001",
      objet: "Test DAO pour vérification chef_projet",
      description: "DAO de test pour vérifier l'affichage du chef dans le tableau",
      chefEquipe: 47, // manager1
      membres: [49, 50], // Ajouter des membres
      autorite: "Test autorité",
      date_depot: "2026-02-20",
      statut: "enCours"
    };
    
    console.log('Données de création:');
    console.log(`  chefEquipe: ${newDaoData.chefEquipe}`);
    console.log(`  membres: [${newDaoData.membres.join(', ')}]`);
    console.log(`  reference: ${newDaoData.reference}`);
    
    try {
      const createResponse = await fetch("http://localhost:3000/api/dao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDaoData)
      });
      
      console.log(`Status création: ${createResponse.status} ${createResponse.ok ? '✅' : '❌'}`);
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.log(`❌ Erreur création: ${errorText}`);
        return;
      }
      
      const createResult = await createResponse.json();
      console.log('✅ DAO créé avec succès:');
      console.log(`  Success: ${createResult.success}`);
      console.log(`  ID: ${createResult.data?.id}`);
      console.log(`  Numéro: ${createResult.data?.numero}`);
      
      const newDaoId = createResult.data?.id;
      
      if (!newDaoId) {
        console.log('❌ Impossible de récupérer l\'ID du nouveau DAO');
        return;
      }
      
      console.log('\n--- Étape 3: Vérification immédiate du DAO créé ---');
      
      // Vérifier le DAO spécifique
      const specificResponse = await fetch(`http://localhost:3000/api/daos/${newDaoId}`);
      console.log(`Status DAO spécifique: ${specificResponse.ok ? '✅' : '❌'} ${specificResponse.status}`);
      
      if (specificResponse.ok) {
        const specificData = await specificResponse.json();
        if (specificData.data) {
          console.log('✅ DAO spécifique récupéré:');
          console.log(`  ID: ${specificData.data.id}`);
          console.log(`  chef_id: ${specificData.data.chef_id || 'NULL'}`);
          console.log(`  chef_projet: ${specificData.data.chef_projet || 'NULL'}`);
          console.log(`  reference: ${specificData.data.reference || 'NULL'}`);
          
          const hasChef = specificData.data.chef_projet && specificData.data.chef_projet !== 'N/A';
          console.log(`  Chef affiché: ${hasChef ? '✅' : '❌'}`);
        }
      } else {
        const errorText = await specificResponse.text();
        console.log(`❌ Erreur DAO spécifique: ${errorText}`);
      }
      
      console.log('\n--- Étape 4: Vérification du tableau après création ---');
      
      // Attendre un peu pour la mise à jour
      console.log('Attente 2 secondes pour la mise à jour...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Vérifier la liste des DAOs
      const afterResponse = await fetch("http://localhost:3000/api/dao", { cache: "no-store" });
      const afterData = await afterResponse.json();
      const afterCount = afterData.data ? afterData.data.length : 0;
      console.log(`DAOs après création: ${afterCount} (${afterCount - beforeCount} nouveau)`);
      
      if (afterData.data && afterData.data.length > 0) {
        console.log('\n📊 Analyse des DAOs après création:');
        
        // Chercher le nouveau DAO dans la liste
        const newDaoInList = afterData.data.find(dao => dao.id === newDaoId);
        
        if (newDaoInList) {
          console.log('✅ Nouveau DAO trouvé dans le tableau:');
          console.log(`  ID: ${newDaoInList.id}`);
          console.log(`  Numéro: ${newDaoInList.numero}`);
          console.log(`  chef_id: ${newDaoInList.chef_id || 'NULL'}`);
          console.log(`  chef_projet: ${newDaoInList.chef_projet || 'NULL'}`);
          console.log(`  reference: ${newDaoInList.reference || 'NULL'}`);
          
          const hasChefInList = newDaoInList.chef_projet && newDaoInList.chef_projet !== 'N/A';
          console.log(`  Chef affiché dans tableau: ${hasChefInList ? '✅' : '❌'}`);
          
          if (!hasChefInList) {
            console.log('\n❌ Problème identifié:');
            console.log('Le chef_id est enregistré mais chef_projet est NULL dans le tableau');
            console.log('Cause possible: LEFT JOIN ne fonctionne pas dans l\'API générale');
          }
        } else {
          console.log('❌ Nouveau DAO non trouvé dans le tableau');
        }
        
        // Analyser tous les DAOs pour le problème
        console.log('\n🔍 Analyse complète des DAOs:');
        let daosWithChef = 0;
        let daosWithoutChef = 0;
        
        afterData.data.forEach((dao, index) => {
          const hasChef = dao.chef_projet && dao.chef_projet !== 'N/A' && dao.chef_projet !== '';
          
          if (hasChef) {
            daosWithChef++;
            console.log(`✅ DAO ${index + 1} (${dao.numero}): chef_projet = "${dao.chef_projet}"`);
          } else {
            daosWithoutChef++;
            console.log(`❌ DAO ${index + 1} (${dao.numero}): chef_projet = "${dao.chef_projet || 'NULL'}"`);
            console.log(`   chef_id: ${dao.chef_id || 'NULL'}`);
          }
        });
        
        console.log(`\n📊 Résumé final:`);
        console.log(`   DAOs avec chef: ${daosWithChef}`);
        console.log(`   DAOs sans chef: ${daosWithoutChef}`);
        console.log(`   Taux de succès: ${Math.round((daosWithChef / afterData.data.length) * 100)}%`);
      }
      
      console.log('\n--- Étape 5: Diagnostic du problème ---');
      
      console.log('🔍 Problèmes possibles:');
      console.log('1. L\'API POST n\'enregistre pas correctement chef_id');
      console.log('2. L\'API GET générale n\'utilise pas le LEFT JOIN');
      console.log('3. Le chef_id n\'existe pas dans la table users');
      console.log('4. Problème de conversion de type');
      console.log('5. Cache de l\'API générale');
      
      console.log('\n🔧 Solutions recommandées:');
      console.log('1. Vérifier l\'API POST /api/dao');
      console.log('2. Vérifier l\'API GET /api/dao');
      console.log('3. Vérifier la table users');
      console.log('4. Vérifier la table daos');
      console.log('5. Redémarrer le serveur');
      
    } catch (createError) {
      console.log('❌ Erreur création DAO:', createError.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testCreateDaoAndDisplay();
