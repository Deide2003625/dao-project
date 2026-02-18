// Test pour diagnostiquer pourquoi les chefs ne s'affichent pas dans le tableau admin
async function diagnoseTableDisplay() {
  try {
    console.log('=== DIAGNOSTIC AFFICHAGE TABLEAU ADMIN ===');
    
    console.log('\n--- Étape 1: Vérification des données API ---');
    
    const response = await fetch("http://localhost:3000/api/dao", { cache: "no-store" });
    console.log(`Status API: ${response.ok ? '✅' : '❌'} ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Erreur API: ${errorText}`);
      return;
    }
    
    const data = await response.json();
    console.log(`Nombre de DAOs: ${data.data ? data.data.length : 0}`);
    
    if (data.data && data.data.length > 0) {
      console.log('\n--- Étape 2: Analyse des DAOs ---');
      
      // Prendre les 3 premiers DAOs pour analyse détaillée
      const sampleDaos = data.data.slice(0, 3);
      
      sampleDaos.forEach((dao, index) => {
        console.log(`\nDAO ${index + 1} (${dao.numero}):`);
        console.log(`  ID: ${dao.id}`);
        console.log(`  chef_id: ${dao.chef_id || 'NULL'}`);
        console.log(`  chef_projet: ${dao.chef_projet || 'NULL'}`);
        console.log(`  reference: ${dao.reference || 'NULL'}`);
        console.log(`  statut: ${dao.statut || 'NULL'}`);
        
        // Vérifier si les données sont valides pour l'affichage
        const hasChefId = dao.chef_id && dao.chef_id !== null;
        const hasChefProjet = dao.chef_projet && dao.chef_projet !== null && dao.chef_projet !== 'N/A';
        
        console.log(`  chef_id valide: ${hasChefId ? '✅' : '❌'}`);
        console.log(`  chef_projet valide: ${hasChefProjet ? '✅' : '❌'}`);
        console.log(`  Sera affiché: ${hasChefProjet ? '✅' : '❌'}`);
      });
      
      console.log('\n--- Étape 3: Simulation du rendu du tableau ---');
      
      // Simuler exactement ce que fait le tableau admin
      sampleDaos.forEach((dao, index) => {
        console.log(`\n📊 Rendu DAO ${index + 1}:`);
        console.log(`  Code JSX: {dao.chef_projet || "N/A"}`);
        console.log(`  Valeur: ${dao.chef_projet || "N/A"}`);
        console.log(`  Résultat affiché: "${dao.chef_projet || "N/A"}"`);
        
        // Vérifier si c'est un problème de type
        console.log(`  Type chef_projet: ${typeof dao.chef_projet}`);
        console.log(`  Est une chaîne: ${typeof dao.chef_projet === 'string'}`);
        console.log(`  Est vide: ${dao.chef_projet === ''}`);
        console.log(`  Est null: ${dao.chef_projet === null}`);
        console.log(`  Est undefined: ${dao.chef_projet === undefined}`);
      });
      
      console.log('\n--- Étape 4: Vérification de la structure complète ---');
      
      // Vérifier toutes les propriétés du premier DAO
      const firstDao = sampleDaos[0];
      console.log('\n🔍 Propriétés complètes du premier DAO:');
      Object.keys(firstDao).forEach(key => {
        console.log(`  ${key}: ${firstDao[key]} (${typeof firstDao[key]})`);
      });
      
      console.log('\n--- Étape 5: Test de la logique du tableau ---');
      
      // Tester la logique exacte du tableau admin
      sampleDaos.forEach((dao, index) => {
        const displayValue = dao.chef_projet || "N/A";
        const shouldDisplay = displayValue !== "N/A";
        
        console.log(`\n🎯 Test affichage DAO ${index + 1}:`);
        console.log(`  dao.chef_projet: ${dao.chef_projet}`);
        console.log(`  displayValue: "${displayValue}"`);
        console.log(`  shouldDisplay: ${shouldDisplay ? '✅' : '❌'}`);
        
        if (!shouldDisplay) {
          console.log(`  ❌ Problème: chef_projet est ${dao.chef_projet === null ? 'null' : dao.chef_projet === undefined ? 'undefined' : dao.chef_projet === '' ? 'vide' : dao.chef_projet}`);
        }
      });
      
      console.log('\n--- Étape 6: Diagnostic du problème ---');
      
      const daosWithValidChef = data.data.filter(dao => 
        dao.chef_projet && 
        dao.chef_projet !== null && 
        dao.chef_projet !== undefined && 
        dao.chef_projet !== '' && 
        dao.chef_projet !== 'N/A'
      );
      
      const daosWithoutValidChef = data.data.filter(dao => 
        !dao.chef_projet || 
        dao.chef_projet === null || 
        dao.chef_projet === undefined || 
        dao.chef_projet === '' || 
        dao.chef_projet === 'N/A'
      );
      
      console.log(`📊 Résumé final:`);
      console.log(`   DAOs avec chef valide: ${daosWithValidChef.length}`);
      console.log(`   DAOs sans chef valide: ${daosWithoutValidChef.length}`);
      console.log(`   Taux d\'affichage: ${Math.round((daosWithValidChef.length / data.data.length) * 100)}%`);
      
      if (daosWithoutValidChef.length > 0) {
        console.log(`\n❌ DAOs qui ne s\'afficheront pas:`);
        daosWithoutValidChef.forEach((dao, index) => {
          console.log(`  ${index + 1}. DAO ${dao.numero}: chef_projet = ${dao.chef_projet} (${typeof dao.chef_projet})`);
        });
        
        console.log(`\n🔍 Cause probable:`);
        console.log(`1. chef_projet est null/undefined dans l\'API`);
        console.log(`2. chef_projet est une chaîne vide`);
        console.log(`3. chef_projet est "N/A"`);
        console.log(`4. Problème de conversion de type`);
      } else {
        console.log(`\n✅ Tous les DAOs devraient afficher leur chef !`);
        console.log(`Le problème est ailleurs (cache, rafraîchissement, etc.)`);
      }
    }
    
    console.log('\n--- Étape 7: Solutions recommandées ---');
    
    console.log(`🔧 Actions immédiates:`);
    console.log(`1. Rafraîchir la page admin (Ctrl+F5)`);
    console.log(`2. Vider le cache du navigateur`);
    console.log(`3. Vérifier la console du navigateur (F12)`);
    console.log(`4. Tester en mode navigation privée`);
    console.log(`5. Vérifier les logs React dans les outils de développement`);
    
    console.log(`\n🔧 Développement:`);
    console.log(`1. Ajouter des console.log dans le composant du tableau`);
    console.log(`2. Vérifier le state React avec React DevTools`);
    console.log(`3. Ajouter un useEffect pour surveiller les changements`);
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

diagnoseTableDisplay();
