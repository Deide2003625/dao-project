// Test direct de l'API générale pour vérifier chef_projet
async function testGeneralApi() {
  try {
    console.log('=== TEST API GÉNÉRALE POUR CHEF_PROJET ===');
    
    console.log('\n--- Étape 1: Test API générale /api/dao ---');
    
    const response = await fetch("http://localhost:3000/api/dao", { cache: "no-store" });
    console.log(`Status API générale: ${response.ok ? '✅' : '❌'} ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Erreur API: ${errorText.substring(0, 100)}...`);
      return;
    }
    
    const data = await response.json();
    console.log(`Structure réponse: ${data.success ? '✅ success' : '❌ error'}`);
    console.log(`Nombre de DAOs: ${data.data ? data.data.length : 0}`);
    
    if (data.data && data.data.length > 0) {
      console.log('\n--- Étape 2: Analyse détaillée des DAOs ---');
      
      let daosWithChef = 0;
      let daosWithoutChef = 0;
      
      data.data.forEach((dao, index) => {
        const hasChef = dao.chef_projet && dao.chef_projet !== 'N/A' && dao.chef_projet !== '';
        
        if (hasChef) {
          daosWithChef++;
          console.log(`✅ DAO ${index + 1} (${dao.numero}): chef_projet = "${dao.chef_projet}"`);
        } else {
          daosWithoutChef++;
          console.log(`❌ DAO ${index + 1} (${dao.numero}): chef_projet = "${dao.chef_projet || 'N/A'}"`);
        }
        
        // Afficher toutes les propriétés du DAO pour debug
        console.log(`   Propriétés complètes:`);
        console.log(`     id: ${dao.id}`);
        console.log(`     numero: ${dao.numero || 'N/A'}`);
        console.log(`     reference: ${dao.reference || 'N/A'}`);
        console.log(`     chef_id: ${dao.chef_id || 'N/A'}`);
        console.log(`     chef_projet: ${dao.chef_projet || 'N/A'}`);
        console.log(`     statut: ${dao.statut || 'N/A'}`);
        console.log(`     date_depot: ${dao.date_depot || 'N/A'}`);
      });
      
      console.log(`\n📊 Résumé API générale:`);
      console.log(`   DAOs avec chef_projet: ${daosWithChef}`);
      console.log(`   DAOs sans chef_projet: ${daosWithoutChef}`);
      console.log(`   Taux de succès: ${Math.round((daosWithChef / data.data.length) * 100)}%`);
      
      if (daosWithoutChef > 0) {
        console.log('\n❌ Problème identifié:');
        console.log('L\'API générale ne retourne pas correctement chef_projet');
        
        // Analyser les DAOs sans chef
        const daosSansChef = data.data.filter(dao => !dao.chef_projet || dao.chef_projet === 'N/A');
        console.log('\n🔍 DAOs sans chef_projet:');
        daosSansChef.forEach((dao, index) => {
          console.log(`  ${index + 1}. DAO ${dao.id} (${dao.numero}):`);
          console.log(`     chef_id: ${dao.chef_id || 'N/A'}`);
          console.log(`     chef_projet: ${dao.chef_projet || 'N/A'}`);
        });
      } else {
        console.log('\n✅ L\'API générale fonctionne correctement !');
        console.log('Tous les DAOs ont leur chef_projet affiché');
      }
    }
    
    console.log('\n--- Étape 3: Diagnostic du problème d\'affichage ---');
    
    console.log('🔍 Problèmes possibles dans le tableau admin:');
    console.log('1. Cache du navigateur - ancienne version affichée');
    console.log('2. État React non mis à jour - state ancien');
    console.log('3. Erreur de rendu - problème d\'affichage');
    console.log('4. Données correctes mais non affichées');
    
    console.log('\n🔧 Solutions recommandées:');
    console.log('1. Rafraîchir la page admin (Ctrl+F5)');
    console.log('2. Vider le cache du navigateur');
    console.log('3. Vérifier la console du navigateur (F12)');
    console.log('4. Vérifier les logs React');
    console.log('5. Tester avec un autre navigateur');
    
    console.log('\n=== CONCLUSION ===');
    console.log('🎯 État final:');
    console.log(`   API générale: ${response.ok ? '✅ Fonctionnelle' : '❌ Erreur'}`);
    console.log(`   chef_projet: ${daosWithChef > 0 ? '✅ Disponible' : '❌ Manquant'}`);
    console.log(`   Problème: ${daosWithoutChef > 0 ? '❌ API générale' : '✅ Affichage navigateur'}`);
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testGeneralApi();
