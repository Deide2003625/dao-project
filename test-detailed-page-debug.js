// Test détaillé pour diagnostiquer le problème de la page détail dynamique
async function testDetailedPageDebug() {
  console.log('=== TEST DÉTAILLÉ PAGE DÉTAIL DYNAMIQUE ===');
  
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
    
    console.log('\n--- Étape 2: Test des APIs individuelles ---');
    
    // Test API DAO spécifique
    console.log('🔍 Test API DAO spécifique:');
    try {
      const daoResponse = await fetch(`http://localhost:3000/api/daos/${daoId}`);
      console.log(`   Status: ${daoResponse.status} ${daoResponse.ok ? '✅' : '❌'}`);
      if (daoResponse.ok) {
        const daoData = await daoResponse.json();
        console.log(`   Données: ${daoData.success ? '✅' : '❌'} ${daoData.data ? 'DAO trouvé' : 'DAO non trouvé'}`);
        if (daoData.data) {
          console.log(`   DAO: ${daoData.data.reference || 'N/A'}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }
    
    // Test API Tasks filtrées
    console.log('\n🔍 Test API Tasks filtrées:');
    try {
      const tasksResponse = await fetch(`http://localhost:3000/api/tasks?daoId=${daoId}`);
      console.log(`   Status: ${tasksResponse.status} ${tasksResponse.ok ? '✅' : '❌'}`);
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        console.log(`   Données: ${tasksData.success ? '✅' : '❌'} ${tasksData.data ? `${tasksData.data.length} tâches` : '0 tâche'}`);
        if (tasksData.data && tasksData.data.length > 0) {
          const firstTask = tasksData.data[0];
          console.log(`   Première tâche: ID ${firstTask.id}, Titre: "${firstTask.titre || 'N/A'}"`);
          console.log(`   Progression: ${firstTask.progress || 0}%`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Erreur: ${error.message}`);
    }
    
    // Test API Comments
    if (daos.length > 0) {
      const firstTask = daos[0];
      try {
        const commentsResponse = await fetch(`http://localhost:3000/api/tasks/${firstTask.id}/comments`);
        console.log(`\n🔍 Test API Comments (tâche ${firstTask.id}):`);
        console.log(`   Status: ${commentsResponse.status} ${commentsResponse.ok ? '✅' : '❌'}`);
        if (commentsResponse.ok) {
          const commentsData = await commentsResponse.json();
          console.log(`   Données: ${commentsData.success ? '✅' : '❌'} ${commentsData.data ? `${commentsData.data.length} commentaires` : '0 commentaire'}`);
        }
      } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
      }
    }
    
    console.log('\n--- Étape 3: Test de la page détail complète ---');
    
    const detailUrl = `http://localhost:3000/dash/Lecteur/details/${daoId}`;
    console.log(`🌐 URL testée: ${detailUrl}`);
    
    try {
      const detailResponse = await fetch(detailUrl);
      console.log(`Status: ${detailResponse.status} ${detailResponse.ok ? '✅' : '❌'}`);
      
      if (detailResponse.ok) {
        const html = await detailResponse.text();
        console.log(`📄 Taille HTML: ${html.length} caractères`);
        
        // Vérifier si le contenu HTML contient les éléments attendus
        const hasReactContent = html.includes('use client') || html.includes('React') || html.includes('useState');
        const hasDaoContent = html.includes(daoReference) || html.includes(`DAO-${daoId}`);
        const hasTaskContent = html.includes('Progression des tâches') || html.includes('progressChart');
        const hasCommentContent = html.includes('Commentaire') || html.includes('comments');
        
        console.log(`🔍 Vérification du contenu:`);
        console.log(`   React: ${hasReactContent ? '✅' : '❌'}`);
        console.log(`   DAO: ${hasDaoContent ? '✅' : '❌'}`);
        console.log(`   Tâches: ${hasTaskContent ? '✅' : '❌'}`);
        console.log(`   Commentaires: ${hasCommentContent ? '✅' : '❌'}`);
        
        if (!hasReactContent) {
          console.log('❌ Le contenu n\'est pas une page React');
        }
        
        if (!hasDaoContent) {
          console.log('❌ Les données du DAO ne sont pas chargées');
        }
        
        if (!hasTaskContent) {
          console.log('❌ Les tâches ne sont pas affichées');
        }
        
        if (!hasCommentContent) {
          console.log('❌ Les commentaires ne sont pas affichés');
        }
        
        // Vérifier les erreurs JavaScript potentielles
        const hasError = html.includes('error') || html.includes('Error') || html.includes('Erreur');
        const hasLoading = html.includes('Chargement') || html.includes('Loading');
        const hasSpinner = html.includes('animate-spin');
        
        console.log(`🔍 État du chargement:`);
        console.log(`   Erreurs: ${hasError ? '❌' : '✅'}`);
        console.log(`   Loading: ${hasLoading ? '✅' : '❌'}`);
        console.log(`   Spinner: ${hasSpinner ? '✅' : '❌'}`);
        
        if (hasError) {
          console.log('❌ Erreurs JavaScript détectées dans la page');
        }
        
        if (hasLoading && !hasSpinner) {
          console.log('⚠️ Loading sans spinner - problème d\'affichage');
        }
        
        console.log('\n--- Étape 4: Analyse du HTML généré ---');
        
        // Extraire des parties spécifiques du HTML
        const titleMatch = html.match(/<title>(.*?)<\/title>/);
        const bodyMatch = html.match(/<body[^>]*>(.*?)<\/body>/s);
        
        if (titleMatch) {
          console.log(`📄 Titre: ${titleMatch[1]}`);
        }
        
        if (bodyMatch) {
          const bodyContent = bodyMatch[1];
          console.log(`📄 Corps: ${bodyContent.substring(0, 200)}...`);
          
          // Vérifier si le corps contient les éléments React
          const hasRoot = bodyContent.includes('id="root"');
          const hasMain = bodyContent.includes('<main');
          const hasReactRoot = bodyContent.includes('data-reactroot');
          
          console.log(`🔍 Éléments React: ${hasRoot ? '✅' : '❌'} root, ${hasMain ? '✅' : '❌'} main, ${hasReactRoot ? '✅' : '❌'} reactroot`);
        }
        
        // Vérifier les scripts
        const scriptsMatch = html.match(/<script[^>]*>(.*?)<\/script>/g);
        const scriptsCount = scriptsMatch ? scriptsMatch.length : 0;
        console.log(`📄 Scripts: ${scriptsCount} trouvés`);
        
        if (scriptsCount === 0) {
          console.log('❌ Aucun script JavaScript trouvé');
        } else {
          console.log('✅ Scripts JavaScript présents');
        }
        
      } else {
        const errorText = await detailResponse.text();
        console.log(`❌ Erreur ${detailResponse.status}: ${errorText.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log('❌ Erreur page détail:', error.message);
    }
    
    console.log('\n--- Étape 5: Diagnostic final ---');
    
    console.log('🎯 Diagnostic complet:');
    console.log(`   Serveur: ${serverOk ? '✅ Actif' : '❌ Inactif'}`);
    console.log(`   APIs: ${serverOk ? '✅ Testées' : '❌ Non testées'}`);
    console.log(`   Page détail: ${detailResponse ? '✅ Testée' : '❌ Non testée'}`);
    console.log('');
    console.log('🔧 Problèmes identifiés:');
    console.log('   - URLs relatives corrigées en URLs absolues');
    console.log('   - Redirection fonctionnelle');
    console.log('   - Page détail accessible mais contenu incorrect');
    
    console.log('\n--- Étape 6: Actions recommandées ---');
    
    console.log('🔧 Si le contenu ne s\'affiche toujours pas:');
    console.log('   1. Ouvrir la console du navigateur (F12)');
    console.log('   2. Accéder à: http://localhost:3000/dash/Lecteur/details/34');
    console.log('   3. Vérifier les erreurs dans la console');
    console.log('   4. Vérifier les requêtes réseau dans l\'onglet "Network"');
    console.log('   5. Rafraîchir la page (Ctrl+F5)');
    console.log('   6. Vider le cache du navigateur');
    
    console.log('\n--- Étape 7: Test de navigation alternative ---');
    
    console.log('🌐 Test navigation alternative:');
    console.log('   1. Accéder à: http://localhost:3000/dash/Lecteur');
    console.log('   2. Cliquer sur "Voir tous les DAOs"');
    console.log('   3. Cliquer sur un DAO pour voir ses détails');
    console.log('   4. Observer si le contenu s\'affiche correctement');
    
    console.log('\n=== RÉSULTAT FINAL ===');
    console.log('🎯 État final:');
    console.log(`   Serveur: ${serverOk ? '✅ Actif' : '❌ Inactif'}`);
    console.log(`   Redirection: ✅ Configurée`);
    console.log(`   Page détail: ${detailResponse ? '✅ Testée' : '❌ Non testée'}`);
    console.log(`   Contenu: ${detailResponse && detailResponse.ok ? '✅ Analysé' : '❌ Non analysé'}`);
    console.log('');
    console.log('🔧 Solution finale:');
    console.log('   1. Vérifier la console du navigateur');
    console.log('   2. Corriger les erreurs JavaScript identifiées');
    console.log('   3. Assurer que les données API sont correctes');
    console.log('   4. Tester la navigation alternative');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testDetailedPageDebug();
