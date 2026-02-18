// Test pour diagnostiquer l'erreur 500 dans l'API POST
async function diagnose500Error() {
  try {
    console.log('=== DIAGNOSTIC ERREUR 500 API POST ===');
    
    console.log('\n--- Étape 1: Test avec données minimales ---');
    
    // Tester avec les données les plus simples possibles
    const minimalDaoData = {
      reference: "TEST_MINIMAL_" + Date.now(),
      objet: "Test minimal",
      description: "Test description",
      autorite: "Test autorité",
      date_depot: "2026-02-20",
      chefEquipe: 47,
      membres: [] // Pas de membres pour éviter la validation
    };
    
    console.log('Données minimales:');
    console.log(`  reference: ${minimalDaoData.reference}`);
    console.log(`  chefEquipe: ${minimalDaoData.chefEquipe}`);
    console.log(`  membres: [] (vide)`);
    
    try {
      const minimalResponse = await fetch("http://localhost:3000/api/dao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(minimalDaoData)
      });
      
      console.log(`Status minimal: ${minimalResponse.status} ${minimalResponse.ok ? '✅' : '❌'}`);
      
      if (!minimalResponse.ok) {
        const errorText = await minimalResponse.text();
        console.log(`❌ Erreur minimale: ${errorText}`);
      } else {
        const minimalResult = await minimalResponse.json();
        console.log('✅ DAO minimal créé:', minimalResult);
      }
      
    } catch (minimalError) {
      console.log('❌ Erreur test minimal:', minimalError.message);
    }
    
    console.log('\n--- Étape 2: Test sans membres ---');
    
    // Tester sans le champ membres
    const noMembersData = {
      reference: "TEST_NO_MEMBERS_" + Date.now(),
      objet: "Test sans membres",
      description: "Test description",
      autorite: "Test autorité",
      date_depot: "2026-02-20",
      chefEquipe: 47
      // Pas de champ membres du tout
    };
    
    console.log('Données sans membres:');
    console.log(`  reference: ${noMembersData.reference}`);
    console.log(`  chefEquipe: ${noMembersData.chefEquipe}`);
    console.log(`  membres: non défini`);
    
    try {
      const noMembersResponse = await fetch("http://localhost:3000/api/dao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noMembersData)
      });
      
      console.log(`Status sans membres: ${noMembersResponse.status} ${noMembersResponse.ok ? '✅' : '❌'}`);
      
      if (!noMembersResponse.ok) {
        const errorText = await noMembersResponse.text();
        console.log(`❌ Erreur sans membres: ${errorText}`);
      } else {
        const noMembersResult = await noMembersResponse.json();
        console.log('✅ DAO sans membres créé:', noMembersResult);
        
        // Vérifier si le chef s'affiche
        if (noMembersResult.data?.id) {
          const checkResponse = await fetch("http://localhost:3000/api/dao", { cache: "no-store" });
          const checkData = await checkResponse.json();
          
          if (checkData.data) {
            const newDao = checkData.data.find(dao => dao.id === noMembersResult.data.id);
            if (newDao) {
              console.log('\n📊 Vérification DAO sans membres:');
              console.log(`  chef_id: ${newDao.chef_id || 'NULL'}`);
              console.log(`  chef_projet: ${newDao.chef_projet || 'NULL'}`);
              
              const hasChef = newDao.chef_projet && newDao.chef_projet !== 'N/A';
              console.log(`  Chef affiché: ${hasChef ? '✅' : '❌'}`);
              
              if (hasChef) {
                console.log('\n🎯 SOLUTION TROUVÉE !');
                console.log('Le problème était la validation des membres.');
                console.log('Sans membres, le DAO se crée et le chef s\'affiche.');
              }
            }
          }
        }
      }
      
    } catch (noMembersError) {
      console.log('❌ Erreur test sans membres:', noMembersError.message);
    }
    
    console.log('\n--- Étape 3: Diagnostic final ---');
    
    console.log('🔍 Analyse des erreurs:');
    console.log('1. Si le test minimal échoue: problème dans l\'API POST de base');
    console.log('2. Si le test sans membres réussit: problème dans la validation des membres');
    console.log('3. Si tous échouent: problème de connexion ou de table');
    
    console.log('\n🔧 Solutions possibles:');
    console.log('1. Corriger la validation des membres dans l\'API POST');
    console.log('2. Rendre les membres optionnels');
    console.log('3. Ajouter des logs dans l\'API POST pour debug');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

diagnose500Error();
