// Test final pour vérifier l'affichage correct des statistiques dans le dashboard
async function testFinalStatsDisplay() {
  console.log('=== TEST FINAL AFFICHAGE STATISTIQUES DASHBOARD ===');
  
  try {
    console.log('\n--- Étape 1: Vérification des données brutes ---');
    
    const daosResponse = await fetch('http://localhost:3000/api/daos');
    const daosData = await daosResponse.json();
    const daos = daosData.data || [];
    
    console.log(`📊 DAOs disponibles: ${daos.length}`);
    
    console.log('\n--- Étape 2: Simulation du calcul des statistiques (logique corrigée) ---');
    
    const stats = {
      totalDaos: daos.length,
      completedDaos: daos.filter(d => {
        const statut = String(d.statut || "").toUpperCase();
        return statut === "TERMINEE" || statut === "TERMINE";
      }).length,
      inProgressDaos: daos.filter(d => {
        const statut = String(d.statut || "").toUpperCase();
        if (statut === "TERMINEE" || statut === "TERMINE") {
          return false;
        }
        if (!d.date_depot) {
          return true;
        }
        const dateDepot = new Date(d.date_depot);
        const today = new Date();
        const diffMs = dateDepot.getTime() - today.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return diffDays >= 4; // ✅ CORRECTION APPLIQUÉE
      }).length,
      atRiskDaos: daos.filter(d => {
        const statut = String(d.statut || "").toUpperCase();
        if (statut === "TERMINEE" || statut === "TERMINE") {
          return false;
        }
        if (!d.date_depot) {
          return false;
        }
        const dateDepot = new Date(d.date_depot);
        const today = new Date();
        const diffMs = dateDepot.getTime() - today.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return diffDays <= 3;
      }).length,
    };
    
    console.log('📊 Statistiques calculées:');
    console.log(`   Total DAOs: ${stats.totalDaos}`);
    console.log(`   Terminées: ${stats.completedDaos}`);
    console.log(`   En cours: ${stats.inProgressDaos}`);
    console.log(`   À risque: ${stats.atRiskDaos}`);
    
    console.log('\n--- Étape 3: Vérification de la cohérence ---');
    
    const totalCalculated = stats.completedDaos + stats.inProgressDaos + stats.atRiskDaos;
    
    if (totalCalculated === stats.totalDaos) {
      console.log('✅ Cohérence vérifiée: Total des statuts = Total des DAOs');
    } else {
      console.log(`❌ Incohérence: ${totalCalculated} statuts calculés vs ${stats.totalDaos} DAOs`);
    }
    
    console.log('\n--- Étape 4: Détail des DAOs par statut ---');
    
    daos.forEach((dao, index) => {
      const statut = String(dao.statut || "").toUpperCase();
      let statusLabel = 'INCONNU';
      
      if (statut === "TERMINEE" || statut === "TERMINE") {
        statusLabel = 'TERMINEE';
      } else if (!dao.date_depot) {
        statusLabel = 'EN COURS (pas de date)';
      } else {
        const dateDepot = new Date(dao.date_depot);
        const today = new Date();
        const diffMs = dateDepot.getTime() - today.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 4) {
          statusLabel = 'EN COURS';
        } else if (diffDays <= 3) {
          statusLabel = 'À RISQUE';
        } else {
          statusLabel = 'EN COURS';
        }
      }
      
      console.log(`   ${index + 1}. ${dao.reference || `DAO-${dao.id}`}: ${statusLabel}`);
    });
    
    console.log('\n--- Étape 5: Simulation de l\'affichage dans le dashboard ---');
    
    console.log('🎯 Cartes statistiques qui devraient s\'afficher:');
    console.log(`   📋 Total DAOs: ${stats.totalDaos} (carte bleue)`);
    console.log(`   ✅ Terminées: ${stats.completedDaos} (carte verte)`);
    console.log(`   🔄 En cours: ${stats.inProgressDaos} (carte jaune)`);
    console.log(`   ⚠️  À risque: ${stats.atRiskDaos} (carte rouge)`);
    
    console.log('\n--- Étape 6: Vérification des badges ---');
    
    console.log('🏷️  Badges des DAOs dans la liste:');
    daos.forEach((dao, index) => {
      const statut = String(dao.statut || "").toUpperCase();
      let badgeColor = 'gris';
      let badgeLabel = 'Inconnu';
      
      if (statut === "TERMINEE" || statut === "TERMINE") {
        badgeColor = 'vert';
        badgeLabel = 'Terminée';
      } else if (!dao.date_depot) {
        badgeColor = 'jaune';
        badgeLabel = 'En cours';
      } else {
        const dateDepot = new Date(dao.date_depot);
        const today = new Date();
        const diffMs = dateDepot.getTime() - today.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 4) {
          badgeColor = 'jaune';
          badgeLabel = 'En cours';
        } else if (diffDays <= 3) {
          badgeColor = 'rouge';
          badgeLabel = 'À risque';
        }
      }
      
      console.log(`   ${index + 1}. ${dao.reference || `DAO-${dao.id}`}: Badge ${badgeColor} "${badgeLabel}"`);
    });
    
    console.log('\n=== RÉSULTAT FINAL ===');
    console.log('🎯 Le dashboard Lecteur devrait maintenant afficher:');
    console.log(`   ✅ ${stats.totalDaos} DAOs au total`);
    console.log(`   ✅ ${stats.completedDaos} DAO(s) terminé(s)`);
    console.log(`   ✅ ${stats.inProgressDaos} DAO(s) en cours`);
    console.log(`   ✅ ${stats.atRiskDaos} DAO(s) à risque`);
    console.log('');
    console.log('🔧 Correction appliquée:');
    console.log('   - Changement de "diffDays >= 5" à "diffDays >= 4"');
    console.log('   - Inclusion du cas "4 jours" dans "en cours"');
    console.log('   - Cohérence entre calcul et affichage');
    console.log('');
    console.log('🌐 Test visuel recommandé:');
    console.log('   1. Accéder à: http://localhost:3000/dash/Lecteur');
    console.log('   2. Vérifier les 4 cartes statistiques');
    console.log('   3. Confirmer: "En cours" = 3, "À risque" = 2');
    console.log('   4. Vérifier les badges colorés des DAOs');
    console.log('   5. Confirmer la cohérence statistiques ↔ badges');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testFinalStatsDisplay();
