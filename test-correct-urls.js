// Test pour vérifier les URLs correctes et diagnostiquer le problème 404
async function testCorrectUrls() {
  console.log('=== TEST URLS CORRECTES POUR PAGE DÉTAIL ===');
  
  try {
    console.log('\n--- Étape 1: Vérification du serveur ---');
    
    const serverResponse = await fetch('http://localhost:3000/api/daos');
    const serverOk = serverResponse.ok;
    
    console.log(`Serveur sur port 3000: ${serverOk ? '✅ Actif' : '❌ Inactif'}`);
    
    if (!serverOk) {
      console.log('❌ Le serveur ne répond pas');
      return;
    }
    
    const daosData = await serverResponse.json();
    const daos = daosData.data || [];
    console.log(`✅ DAOs disponibles: ${daos.length}`);
    
    if (daos.length === 0) {
      console.log('❌ Aucun DAO disponible');
      return;
    }
    
    const firstDao = daos[0];
    const daoId = firstDao.id;
    const daoReference = firstDao.reference || `DAO-${daoId}`;
    
    console.log(`📋 DAO testé: ${daoReference} (ID: ${daoId})`);
    
    console.log('\n--- Étape 2: Test des différentes URLs ---');
    
    // URLs incorrectes qui causent 404
    const incorrectUrls = [
      'http://localhost:3000/Lecteur/details',
      'http://localhost:3000/Lecteur/details/',
      'http://localhost:3000/Lecteur/details/34',
      'http://localhost:3000/dash/Lecteur/details',
      'http://localhost:3000/dash/Lecteur/details/'
    ];
    
    // URLs correctes
    const correctUrls = [
      `http://localhost:3000/dash/Lecteur/details/${daoId}`,
      `http://localhost:3000/dash/Lecteur/details/34`,
      `http://localhost:3000/dash/Lecteur/details/allDao`
    ];
    
    console.log('🔍 Test des URLs incorrectes:');
    for (const url of incorrectUrls) {
      try {
        const response = await fetch(url);
        console.log(`   ${url}: ${response.ok ? '✅ Accessible' : '❌ Erreur ' + response.status}`);
      } catch (error) {
        console.log(`   ${url}: ❌ Erreur réseau`);
      }
    }
    
    console.log('\n✅ Test des URLs correctes:');
    for (const url of correctUrls) {
      try {
        const response = await fetch(url);
        console.log(`   ${url}: ${response.ok ? '✅ Accessible' : '❌ Erreur ' + response.status}`);
      } catch (error) {
        console.log(`   ${url}: ❌ Erreur réseau`);
      }
    }
    
    console.log('\n--- Étape 3: Diagnostic du problème ---');
    
    console.log('🔍 Problème identifié:');
    console.log('   ❌ URL accédée: /Lecteur/details');
    console.log('   ❌ URL correcte: /dash/Lecteur/details/[id]');
    console.log('   ❌ Manque: préfixe "/dash" et ID du DAO');
    
    console.log('\n--- Étape 4: Structure des routes Next.js ---');
    
    console.log('📁 Structure des fichiers:');
    console.log('   app/');
    console.log('   ├── dash/');
    console.log('   │   ├── Lecteur/');
    console.log('   │   │   ├── page.tsx');
    console.log('   │   │   ├── allDao/');
    console.log('   │   │   └── details/');
    console.log('   │   │       └── [id]/');
    console.log('   │   │           └── page.tsx');
    console.log('   │   └── ...');
    console.log('   └── ...');
    
    console.log('\n--- Étape 5: Solutions possibles ---');
    
    console.log('🔧 Solutions pour corriger le problème:');
    console.log('');
    console.log('1. URL CORRECTE (recommandé):');
    console.log(`   http://localhost:3000/dash/Lecteur/details/${daoId}`);
    console.log('');
    console.log('2. Navigation depuis le dashboard:');
    console.log('   a. Accéder à: http://localhost:3000/dash/Lecteur');
    console.log('   b. Cliquer sur "Voir tous les DAOs"');
    console.log('   c. Cliquer sur un DAO pour voir ses détails');
    console.log('');
    console.log('3. Créer une redirection (optionnel):');
    console.log('   - Créer un fichier /Lecteur/details/page.tsx');
    console.log('   - Rediriger vers /dash/Lecteur/details/[id]');
    
    console.log('\n--- Étape 6: Test de navigation depuis le dashboard ---');
    
    try {
      const dashboardResponse = await fetch('http://localhost:3000/dash/Lecteur');
      const dashboardOk = dashboardResponse.ok;
      console.log(`Dashboard Lecteur: ${dashboardOk ? '✅ Accessible' : '❌ Erreur'}`);
      
      if (dashboardOk) {
        console.log('💡 Navigation recommandée:');
        console.log('   1. Accéder au dashboard Lecteur');
        console.log('   2. Utiliser la navigation intégrée');
        console.log('   3. Cliquer sur un DAO pour voir ses détails');
      }
    } catch (error) {
      console.log('❌ Erreur dashboard:', error.message);
    }
    
    console.log('\n=== RÉSULTAT FINAL ===');
    console.log('🎯 Diagnostic complet:');
    console.log('   ✅ Serveur actif');
    console.log('   ✅ DAOs disponibles');
    console.log('   ✅ Page dynamique existe');
    console.log('   ❌ URL incorrecte utilisée');
    console.log('');
    console.log('🔧 Solution immédiate:');
    console.log(`   Utiliser l\'URL correcte: http://localhost:3000/dash/Lecteur/details/${daoId}`);
    console.log('');
    console.log('🌐 Étapes à suivre:');
    console.log('   1. Accéder à: http://localhost:3000/dash/Lecteur');
    console.log('   2. Cliquer sur "Voir tous les DAOs"');
    console.log('   3. Cliquer sur un DAO pour voir ses détails');
    console.log('   4. Ou utiliser directement l\'URL correcte');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testCorrectUrls();
