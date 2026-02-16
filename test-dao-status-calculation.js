// Test pour analyser le calcul des statuts des DAOs
async function testDaoStatusCalculation() {
  console.log('=== ANALYSE CALCUL STATUTS DAOs ===');
  
  try {
    // Récupérer les DAOs
    const daosResponse = await fetch('http://localhost:3000/api/daos');
    if (!daosResponse.ok) {
      console.log('❌ Erreur API DAOs');
      return;
    }
    
    const daosData = await daosResponse.json();
    const daos = daosData.data || [];
    
    console.log(`📊 Nombre total de DAOs: ${daos.length}`);
    
    console.log('\n--- Analyse détaillée de chaque DAO ---');
    
    let completedCount = 0;
    let inProgressCount = 0;
    let atRiskCount = 0;
    let otherCount = 0;
    
    daos.forEach((dao, index) => {
      console.log(`\n🔍 DAO ${index + 1}: ${dao.reference || `DAO-${dao.id}`}`);
      console.log(`   ID: ${dao.id}`);
      console.log(`   Statut: "${dao.statut || 'vide'}"`);
      console.log(`   Date dépôt: ${dao.date_depot || 'non définie'}`);
      
      // Analyse du statut selon la logique actuelle
      const statut = String(dao.statut || "").toUpperCase();
      console.log(`   Statut (uppercase): "${statut}"`);
      
      let calculatedStatus = 'AUTRE';
      
      if (statut === "TERMINEE" || statut === "TERMINE") {
        calculatedStatus = 'TERMINEE';
        completedCount++;
      } else if (!dao.date_depot) {
        calculatedStatus = 'EN COURS (pas de date)';
        inProgressCount++;
      } else {
        const dateDepot = new Date(dao.date_depot);
        const today = new Date();
        const diffMs = dateDepot.getTime() - today.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        console.log(`   Date dépôt: ${dateDepot.toDateString()}`);
        console.log(`   Aujourd'hui: ${today.toDateString()}`);
        console.log(`   Différence en jours: ${diffDays}`);
        
        if (diffDays >= 5) {
          calculatedStatus = 'EN COURS (>= 5 jours)';
          inProgressCount++;
        } else if (diffDays <= 3) {
          calculatedStatus = 'À RISQUE (<= 3 jours)';
          atRiskCount++;
        } else {
          calculatedStatus = 'EN COURS (4 jours)';
          inProgressCount++;
        }
      }
      
      console.log(`   📊 Statut calculé: ${calculatedStatus}`);
    });
    
    console.log('\n--- Résumé des calculs ---');
    console.log(`✅ Terminées: ${completedCount}`);
    console.log(`🔄 En cours: ${inProgressCount}`);
    console.log(`⚠️  À risque: ${atRiskCount}`);
    console.log(`❓ Autres: ${otherCount}`);
    console.log(`📋 Total: ${completedCount + inProgressCount + atRiskCount + otherCount}`);
    
    console.log('\n--- Comparaison avec le dashboard ---');
    console.log('Dashboard affiche:');
    console.log(`   - En cours: 2`);
    console.log(`   - À risque: 2`);
    console.log(`   - Terminées: 0`);
    
    console.log('\n--- Détection du problème ---');
    if (inProgressCount !== 2) {
      console.log(`❌ Problème détecté: ${inProgressCount} DAOs en cours calculées vs 2 affichées`);
    } else {
      console.log(`✅ Le calcul correspond à l'affichage: ${inProgressCount} DAOs en cours`);
    }
    
    if (atRiskCount !== 2) {
      console.log(`❌ Problème détecté: ${atRiskCount} DAOs à risque calculées vs 2 affichées`);
    } else {
      console.log(`✅ Le calcul correspond à l'affichage: ${atRiskCount} DAOs à risque`);
    }
    
    console.log('\n--- Recommandations ---');
    console.log('1. Vérifier la logique de calcul des statuts');
    console.log('2. Confirmer les valeurs des champs statut et date_depot');
    console.log('3. Ajouter des logs dans le dashboard pour déboguer');
    console.log('4. Vérifier le format des dates dans la base');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testDaoStatusCalculation();
