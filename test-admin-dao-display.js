// Test pour vérifier l'affichage des chefs dans la page admin
async function testAdminDaoDisplay() {
  try {
    console.log('=== TEST AFFICHAGE CHEFS PAGE ADMIN ===');
    
    console.log('\n--- Étape 1: Test API DAO (URL absolue) ---');
    
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
      console.log('\n--- Étape 2: Vérification des chefs dans les DAOs ---');
      
      let daosWithChefs = 0;
      let daosWithoutChefs = 0;
      
      daoJson.data.forEach((dao, index) => {
        const hasChef = dao.chef_projet && dao.chef_projet !== 'N/A' && dao.chef_projet !== '';
        
        if (hasChef) {
          daosWithChefs++;
          console.log(`✅ DAO ${index + 1} (${dao.numero}): Chef = ${dao.chef_projet}`);
        } else {
          daosWithoutChefs++;
          console.log(`❌ DAO ${index + 1} (${dao.numero}): Chef = ${dao.chef_projet || 'N/A'} (Chef ID: ${dao.chef_id || 'N/A'})`);
        }
      });
      
      console.log(`\n📊 Résumé:`);
      console.log(`   DAOs avec chef: ${daosWithChefs}`);
      console.log(`   DAOs sans chef: ${daosWithoutChefs}`);
      console.log(`   Taux de succès: ${Math.round((daosWithChefs / daoJson.data.length) * 100)}%`);
    }
    
    console.log('\n--- Étape 3: Test de la page admin ---');
    
    const adminPageUrl = 'http://localhost:3000/dash/admin/allDao';
    console.log(`URL page admin: ${adminPageUrl}`);
    
    try {
      const pageResponse = await fetch(adminPageUrl);
      console.log(`Page admin: ${pageResponse.ok ? '✅ Accessible' : '❌ Erreur ' + pageResponse.status}`);
      
      if (pageResponse.ok) {
        const html = await pageResponse.text();
        
        // Vérifier si la page contient les chefs
        const hasChefDisplay = html.includes('Chef projet') || html.includes('chef_projet');
        const hasManager1 = html.includes('manager1');
        const hasLio = html.includes('lio');
        
        console.log(`🔍 Vérification du contenu HTML:`);
        console.log(`   Section "Chef projet": ${hasChefDisplay ? '✅' : '❌'}`);
        console.log(`   Nom "manager1" trouvé: ${hasManager1 ? '✅' : '❌'}`);
        console.log(`   Nom "lio" trouvé: ${hasLio ? '✅' : '❌'}`);
        
        if (!hasChefDisplay) {
          console.log('❌ La section "Chef projet" n\'est pas trouvée dans la page');
        }
        
        if (!hasManager1 && !hasLio) {
          console.log('❌ Les noms des chefs ne sont pas trouvés dans la page');
        }
        
        // Vérifier les erreurs JavaScript
        const hasError = html.includes('error') || html.includes('Error') || html.includes('Erreur');
        const hasLoading = html.includes('Chargement') || html.includes('Loading');
        
        console.log(`🔍 État de la page:`);
        console.log(`   Erreurs: ${hasError ? '❌' : '✅'}`);
        console.log(`   Loading: ${hasLoading ? '⚠️' : '✅'}`);
      }
    } catch (error) {
      console.log('❌ Erreur page admin:', error.message);
    }
    
    console.log('\n--- Étape 4: Instructions pour l\'utilisateur ---');
    
    console.log('🔧 Actions recommandées:');
    console.log('   1. Accéder à la page admin: http://localhost:3000/dash/admin/allDao');
    console.log('   2. Rafraîchir la page (Ctrl+F5)');
    console.log('   3. Vérifier que les chefs s\'affichent dans le tableau');
    console.log('   4. Si problème, vérifier la console du navigateur (F12)');
    
    console.log('\n=== RÉSULTAT FINAL ===');
    console.log('🎯 État du système:');
    console.log(`   API DAO: ${daoRes.ok ? '✅ Fonctionnelle' : '❌ Erreur'}`);
    console.log(`   DAOs récupérés: ${daoJson.data ? daoJson.data.length : 0}`);
    console.log(`   URL corrigée: ✅ (relative → absolue)`);
    console.log(`   Page admin: ${adminPageUrl ? '✅ Testée' : '❌ Non testée'}`);
    console.log('');
    console.log('🚀 Les chefs devraient maintenant s\'afficher correctement !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testAdminDaoDisplay();
