// Test pour vérifier l'accès à la page détail dynamique
async function testPageAccess() {
  console.log('=== TEST ACCÈS PAGE DÉTAIL DYNAMIQUE ===');
  
  try {
    console.log('\n--- Étape 1: Vérification du serveur de développement ---');
    
    // Test si le serveur répond
    const serverResponse = await fetch('http://localhost:3000/api/daos');
    const serverOk = serverResponse.ok;
    
    console.log(`Serveur sur port 3000: ${serverOk ? '✅ Actif' : '❌ Inactif'}`);
    
    if (!serverOk) {
      console.log('❌ Le serveur de développement ne répond pas sur le port 3000');
      console.log('💡 Solution: Démarrer le serveur avec "npm run dev"');
      return;
    }
    
    console.log('\n--- Étape 2: Test de l\'API DAOs ---');
    
    const daosData = await serverResponse.json();
    const daos = daosData.data || [];
    console.log(`✅ DAOs disponibles: ${daos.length}`);
    
    if (daos.length === 0) {
      console.log('❌ Aucun DAO disponible');
      return;
    }
    
    // Prendre le premier DAO pour le test
    const firstDao = daos[0];
    const daoId = firstDao.id;
    const daoReference = firstDao.reference || `DAO-${daoId}`;
    
    console.log(`📋 DAO testé: ${daoReference} (ID: ${daoId})`);
    
    console.log('\n--- Étape 3: Test de la page détail dynamique ---');
    
    // Test de la page détail
    const pageUrl = `http://localhost:3000/dash/Lecteur/details/${daoId}`;
    console.log(`🌐 URL testée: ${pageUrl}`);
    
    try {
      const pageResponse = await fetch(pageUrl);
      const pageOk = pageResponse.ok;
      
      console.log(`Page détail: ${pageOk ? '✅ Accessible' : '❌ Erreur'}`);
      
      if (pageOk) {
        console.log('✅ La page détail dynamique fonctionne');
        console.log('💡 Vous pouvez maintenant accéder à la page dans votre navigateur');
      } else {
        console.log(`❌ Erreur ${pageResponse.status}: ${pageResponse.statusText}`);
        
        // Vérifier le contenu de la réponse
        const text = await pageResponse.text();
        console.log('📄 Contenu de la réponse:');
        console.log(text.substring(0, 200) + '...');
      }
    } catch (error) {
      console.log('❌ Erreur lors de l\'accès à la page:', error.message);
    }
    
    console.log('\n--- Étape 4: Vérification des fichiers de route ---');
    
    const fs = require('fs');
    const dynamicPagePath = 'c:/Users/LENOVO/Desktop/dao-project/app/dash/Lecteur/details/[id]/page.tsx';
    const staticPagePath = 'c:/Users/LENOVO/Desktop/dao-project/app/dash/Lecteur/details/page.tsx';
    
    const dynamicExists = fs.existsSync(dynamicPagePath);
    const staticExists = fs.existsSync(staticPagePath);
    
    console.log(`📄 Page dynamique: ${dynamicExists ? '✅ Existe' : '❌ Manquante'}`);
    console.log(`📄 Page statique: ${staticExists ? '❌ Existe (conflit)' : '✅ Supprimée'}`);
    
    if (!dynamicExists) {
      console.log('❌ Le fichier de la page dynamique est manquant');
      return;
    }
    
    if (staticExists) {
      console.log('❌ Le fichier statique existe toujours et cause un conflit');
      return;
    }
    
    console.log('\n--- Étape 5: Diagnostic des routes Next.js ---');
    
    console.log('🔍 Routes Next.js attendues:');
    console.log('   /dash/Lecteur/details/[id] - Route dynamique');
    console.log('   /dash/Lecteur/details/[id]/page.tsx - Composant React');
    console.log('   /dash/Lecteur/details/page.tsx - Fichier statique (supprimé)');
    
    console.log('\n--- Étape 6: Actions recommandées ---');
    
    console.log('🔧 Si la page n\'est toujours pas accessible:');
    console.log('   1. Vérifier que le serveur est bien démarré');
    console.log('   2. Accéder à: http://localhost:3000/dash/Lecteur');
    console.log('   3. Cliquer sur un DAO pour accéder à ses détails');
    console.log('   4. Ou accéder directement: http://localhost:3000/dash/Lecteur/details/34');
    console.log('   5. Vérifier la console du navigateur pour les erreurs');
    
    console.log('\n=== RÉSULTAT FINAL ===');
    console.log('🎯 État du système:');
    console.log(`   Serveur: ${serverOk ? '✅ Actif' : '❌ Inactif'}`);
    console.log(`   Page dynamique: ${dynamicExists ? '✅ Existe' : '❌ Manquante'}`);
    console.log(`   Page statique: ${staticExists ? '❌ Conflit' : '✅ Supprimée'}`);
    console.log('');
    console.log('🌐 Test manuel recommandé:');
    console.log(`   1. Ouvrir: http://localhost:3000/dash/Lecteur/details/${daoId}`);
    console.log('   2. Si erreur 404, vérifier la console du navigateur');
    console.log('   3. Si erreur 500, vérifier les logs du serveur');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testPageAccess();
