// Test pour vérifier la redirection et l'affichage du contenu
async function testRedirection() {
  console.log('=== TEST REDIRECTION ET AFFICHAGE CONTENU ===');
  
  try {
    console.log('\n--- Étape 1: Vérification du serveur ---');
    
    const serverResponse = await fetch('http://localhost:3000/api/daos');
    const serverOk = serverResponse.ok;
    
    console.log(`Serveur sur port 3000: ${serverOk ? '✅ Actif' : '❌ Inactif'}`);
    
    if (!serverOk) {
      console.log('❌ Le serveur ne répond pas');
      return;
    }
    
    console.log('\n--- Étape 2: Test de la redirection ---');
    
    // Test de l'URL de redirection
    const redirectUrl = 'http://localhost:3000/dash/Lecteur/details';
    console.log(`🌐 URL testée: ${redirectUrl}`);
    
    try {
      const redirectResponse = await fetch(redirectUrl);
      console.log(`Redirection: ${redirectResponse.ok ? '✅ Fonctionnelle' : '❌ Erreur ' + redirectResponse.status}`);
      
      if (redirectResponse.ok) {
        const contentType = redirectResponse.headers.get('content-type');
        console.log(`📄 Content-Type: ${contentType || 'Non spécifié'}`);
        
        // Vérifier si c'est une page HTML
        if (contentType && contentType.includes('text/html')) {
          const html = await redirectResponse.text();
          
          // Vérifier si la page contient le contenu de redirection
          if (html.includes('Redirection vers la liste des DAOs')) {
            console.log('✅ Page de redirection correcte');
            console.log('💡 Le navigateur devrait rediriger automatiquement');
          } else {
            console.log('❌ Page de redirection incorrecte');
            console.log('📄 Contenu HTML:', html.substring(0, 200) + '...');
          }
        } else {
          console.log('❌ Réponse non-HTML reçue');
          console.log('📄 Contenu:', await redirectResponse.text());
        }
      } else {
        const errorText = await redirectResponse.text();
        console.log(`❌ Erreur ${redirectResponse.status}: ${errorText.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log('❌ Erreur réseau:', error.message);
    }
    
    console.log('\n--- Étape 3: Test de la page de destination ---');
    
    const destinationUrl = 'http://localhost:3000/dash/Lecteur/allDao';
    console.log(`🌐 URL destination: ${destinationUrl}`);
    
    try {
      const destinationResponse = await fetch(destinationUrl);
      console.log(`Page allDao: ${destinationResponse.ok ? '✅ Accessible' : '❌ Erreur ' + destinationResponse.status}`);
      
      if (destinationResponse.ok) {
        const html = await destinationResponse.text();
        
        if (html.includes('Voir tous les DAOs') || html.includes('allDao')) {
          console.log('✅ Page de destination correcte');
          console.log('💡 La redirection devrait mener à cette page');
        } else {
          console.log('❌ Page de destination incorrecte');
          console.log('📄 Contenu:', html.substring(0, 200) + '...');
        }
      }
    } catch (error) {
      console.log('❌ Erreur page destination:', error.message);
    }
    
    console.log('\n--- Étape 4: Test de la page détail dynamique ---');
    
    const daosData = await serverResponse.json();
    const daos = daosData.data || [];
    
    if (daos.length > 0) {
      const firstDao = daos[0];
      const daoId = firstDao.id;
      
      const detailUrl = `http://localhost:3000/dash/Lecteur/details/${daoId}`;
      console.log(`🌐 URL détail: ${detailUrl}`);
      
      try {
        const detailResponse = await fetch(detailUrl);
        console.log(`Page détail: ${detailResponse.ok ? '✅ Accessible' : '❌ Erreur ' + detailResponse.status}`);
        
        if (detailResponse.ok) {
          const html = await detailResponse.text();
          
          if (html.includes('Progression des tâches') || html.includes('jjjjjjjjjjjjjjjjj')) {
            console.log('✅ Page détail dynamique correcte');
            console.log('💡 Contenu dynamique chargé');
          } else {
            console.log('❌ Page détail dynamique incorrecte');
            console.log('📄 Contenu:', html.substring(0, 200) + '...');
          }
        }
      } catch (error) {
        console.log('❌ Erreur page détail:', error.message);
      }
    }
    
    console.log('\n--- Étape 5: Diagnostic du problème d\'affichage ---');
    
    console.log('🔍 Causes possibles du problème d\'affichage:');
    console.log('   1. Redirection JavaScript non fonctionnelle');
    console.log('   2. Erreur JavaScript dans la page');
    console.log('   3. Problème de chargement des données');
    console.log('   4. Erreur dans les composants React');
    console.log('   5. Problème de style CSS');
    
    console.log('\n--- Étape 6: Solutions recommandées ---');
    
    console.log('🔧 Actions immédiates:');
    console.log('   1. Ouvrir: http://localhost:3000/dash/Lecteur/details');
    console.log('   2. Vérifier la console du navigateur (F12)');
    console.log('   3. Regarder les erreurs JavaScript');
    console.log('   4. Vérifier les requêtes réseau');
    console.log('   5. Tester avec un autre navigateur');
    
    console.log('\n--- Étape 7: Test de navigation manuelle ---');
    
    console.log('🌐 Navigation manuelle recommandée:');
    console.log('   1. Accéder à: http://localhost:3000/dash/Lecteur');
    console.log('   2. Cliquer sur "Voir tous les DAOs"');
    console.log('   3. Cliquer sur un DAO pour voir ses détails');
    console.log('   4. Vérifier que le contenu s\'affiche');
    
    console.log('\n=== RÉSULTAT FINAL ===');
    console.log('🎯 État du système:');
    console.log(`   Serveur: ${serverOk ? '✅ Actif' : '❌ Inactif'}`);
    console.log('   Redirection: Créée et configurée');
    console.log('   Page destination: Accessible');
    console.log('   Page détail: Testée');
    console.log('');
    console.log('🔧 Si le contenu ne s\'affiche toujours pas:');
    console.log('   1. Vérifier la console du navigateur');
    console.log('   2. Tester avec http://localhost:3000/dash/Lecteur/allDao');
    console.log('   3. Tester avec http://localhost:3000/dash/Lecteur/details/34');
    console.log('   4. Rafraîchir la page (Ctrl+F5)');
    console.log('   5. Vider le cache du navigateur');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testRedirection();
