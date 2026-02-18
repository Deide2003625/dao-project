// Test pour vérifier la création DAO avec les bons champs
async function testCreateDaoWithCorrectFields() {
  try {
    console.log('=== TEST CRÉATION DAO AVEC CHAMPS CORRECTS ===');
    
    console.log('\n--- Étape 1: Test avec chef_id (incorrect) ---');
    
    const incorrectData = {
      reference: "TEST_DAO_" + Date.now(),
      numero: "DAO-TEST-001",
      objet: "Test DAO avec chef_id",
      description: "DAO de test avec champ incorrect",
      chef_id: 47, // ❌ Incorrect - l'API attend chefEquipe
      autorite: "Test autorité",
      date_depot: "2026-02-20",
      statut: "enCours"
    };
    
    console.log('Données incorrectes (chef_id):', JSON.stringify(incorrectData, null, 2));
    
    try {
      const incorrectResponse = await fetch("http://localhost:3000/api/dao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(incorrectData)
      });
      
      const incorrectResult = await incorrectResponse.json();
      console.log(`Réponse incorrecte: ${JSON.stringify(incorrectResult, null, 2)}`);
    } catch (error) {
      console.log('❌ Erreur test incorrect:', error.message);
    }
    
    console.log('\n--- Étape 2: Test avec chefEquipe (correct) ---');
    
    const correctData = {
      reference: "TEST_DAO_" + Date.now(),
      numero: "DAO-TEST-002",
      objet: "Test DAO avec chefEquipe",
      description: "DAO de test avec champ correct",
      chefEquipe: 47, // ✅ Correct - l'API attend chefEquipe
      membres: [49, 50], // ✅ Ajouter des membres
      autorite: "Test autorité",
      date_depot: "2026-02-20",
      statut: "enCours"
    };
    
    console.log('Données correctes (chefEquipe):', JSON.stringify(correctData, null, 2));
    
    try {
      const correctResponse = await fetch("http://localhost:3000/api/dao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(correctData)
      });
      
      console.log(`Status création correcte: ${correctResponse.status} ${correctResponse.ok ? '✅' : '❌'}`);
      
      if (correctResponse.ok) {
        const correctResult = await correctResponse.json();
        console.log('DAO créé avec succès:', JSON.stringify(correctResult, null, 2));
        
        if (correctResult.success && correctResult.data) {
          const newDaoId = correctResult.data.id;
          console.log(`Nouveau DAO ID: ${newDaoId}`);
          
          // Vérifier immédiatement le DAO créé
          console.log('\n--- Étape 3: Vérification du DAO créé ---');
          
          const getResponse = await fetch(`http://localhost:3000/api/daos/${newDaoId}`);
          if (getResponse.ok) {
            const getDao = await getResponse.json();
            if (getDao.success && getDao.data) {
              console.log(`DAO ${newDaoId} récupéré:`);
              console.log(`  chef_id: ${getDao.data.chef_id || 'N/A'}`);
              console.log(`  chef_projet: ${getDao.data.chef_projet || 'N/A'}`);
              
              const hasChef = getDao.data.chef_projet && getDao.data.chef_projet !== 'N/A';
              console.log(`  chef affiché: ${hasChef ? '✅' : '❌'}`);
              
              // Vérifier dans le tableau des DAOs
              console.log('\n--- Étape 4: Vérification dans le tableau ---');
              
              const tableResponse = await fetch("http://localhost:3000/api/dao", { cache: "no-store" });
              if (tableResponse.ok) {
                const tableData = await tableResponse.json();
                if (tableData.data) {
                  const daoInTable = tableData.data.find(dao => dao.id === newDaoId);
                  if (daoInTable) {
                    console.log(`DAO trouvé dans le tableau:`);
                    console.log(`  ID: ${daoInTable.id}`);
                    console.log(`  chef_id: ${daoInTable.chef_id || 'N/A'}`);
                    console.log(`  chef_projet: ${daoInTable.chef_projet || 'N/A'}`);
                    
                    const hasChefInTable = daoInTable.chef_projet && daoInTable.chef_projet !== 'N/A';
                    console.log(`  chef affiché dans tableau: ${hasChefInTable ? '✅' : '❌'}`);
                  } else {
                    console.log('❌ DAO non trouvé dans le tableau');
                  }
                }
              }
            }
          } else {
            console.log(`❌ Erreur récupération DAO ${newDaoId}: ${getResponse.status}`);
          }
        }
      } else {
        const errorText = await correctResponse.text();
        console.log(`❌ Erreur création correcte: ${errorText}`);
      }
      
    } catch (error) {
      console.log('❌ Erreur test correct:', error.message);
    }
    
    console.log('\n=== DIAGNOSTIC FINAL ===');
    console.log('🎯 Problème identifié:');
    console.log('L\'API POST /api/dao attend les champs:');
    console.log('- chefEquipe (et non chef_id)');
    console.log('- membres (tableau d\'IDs)');
    console.log('- Les autres champs sont optionnels');
    
    console.log('\n🔧 Solution pour la page de création:');
    console.log('1. Le formulaire doit envoyer chefEquipe au lieu de chef_id');
    console.log('2. Le formulaire doit envoyer membres[] au lieu de membres');
    console.log('3. Vérifier la page CreateDao/page.tsx');
    
    console.log('\n🚀 Résultat attendu:');
    console.log('Une fois les champs corrigés, le chef s\'affichera dans le tableau !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testCreateDaoWithCorrectFields();
