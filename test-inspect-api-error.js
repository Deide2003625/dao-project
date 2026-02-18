// Test détaillé pour inspecter l'erreur API
async function inspectApiError() {
  try {
    console.log('=== INSPECTION DÉTAILLÉE ERREUR API ===');
    
    // Tester avec différents IDs
    const testIds = ['34', '37', '39'];
    
    for (const testId of testIds) {
      console.log(`\n--- Test avec ID: ${testId} ---`);
      
      try {
        const url = `http://localhost:3000/api/daos/${testId}`;
        console.log(`URL: ${url}`);
        
        const response = await fetch(url, { 
          cache: "no-store",
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`Status: ${response.status} ${response.statusText}`);
        console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
        
        const text = await response.text();
        console.log(`Response text:`, text);
        
        let json;
        try {
          json = JSON.parse(text);
          console.log(`Parsed JSON:`, json);
        } catch (parseError) {
          console.log(`JSON parse error:`, parseError.message);
          json = { error: "Invalid JSON", raw: text };
        }
        
        if (response.ok && json.data) {
          console.log('✅ Succès - DAO trouvé:');
          console.log(`  ID: ${json.data.id}`);
          console.log(`  Numero: ${json.data.numero}`);
          console.log(`  Chef: ${json.data.chef_projet || 'N/A'}`);
        } else {
          console.log('❌ Erreur:');
          console.log(`  Status: ${response.status}`);
          console.log(`  Response:`, json);
          
          if (response.status === 500) {
            console.log('\n🔍 Détails erreur 500:');
            console.log('  - Erreur interne du serveur');
            console.log('  - Problème dans le code de l\'API');
            console.log('  - Possible: connexion DB, syntaxe SQL, etc.');
          } else if (response.status === 404) {
            console.log('\n🔍 Détails erreur 404:');
            console.log('  - DAO non trouvé');
            console.log('  - ID inexistant dans la base');
          } else if (response.status === 400) {
            console.log('\n🔍 Détails erreur 400:');
            console.log('  - Requête invalide');
            console.log('  - Paramètres manquants');
          }
        }
        
      } catch (fetchError) {
        console.log(`❌ Erreur fetch:`, fetchError.message);
      }
    }
    
    console.log('\n--- Test API générale pour comparaison ---');
    
    try {
      const generalResponse = await fetch('http://localhost:3000/api/dao', { cache: "no-store" });
      console.log(`API générale status: ${generalResponse.status}`);
      
      if (generalResponse.ok) {
        const generalData = await generalResponse.json();
        console.log(`API générale fonctionne: ${generalData.data?.length || 0} DAOs`);
        
        // Vérifier si les IDs testés existent
        const existingIds = generalData.data?.map(d => d.id.toString()) || [];
        console.log(`IDs existants:`, existingIds);
        
        testIds.forEach(id => {
          const exists = existingIds.includes(id);
          console.log(`ID ${id} existe: ${exists ? '✅' : '❌'}`);
        });
      } else {
        console.log('❌ API générale ne fonctionne pas non plus');
      }
    } catch (generalError) {
      console.log('❌ Erreur API générale:', generalError.message);
    }
    
    console.log('\n=== DIAGNOSTIC FINAL ===');
    console.log('🔧 Actions recommandées:');
    console.log('1. Vérifier que le serveur Next.js est en cours d\'exécution');
    console.log('2. Redémarrer complètement le serveur (Ctrl+C + npm run dev)');
    console.log('3. Vérifier les logs du serveur pour voir les erreurs 500');
    console.log('4. Confirmer que la base de données est accessible');
    console.log('5. Tester manuellement l\'URL dans le navigateur');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

inspectApiError();
