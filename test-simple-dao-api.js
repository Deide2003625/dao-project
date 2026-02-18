// Test simple pour vérifier si l'API DAO spécifique fonctionne
async function testSimpleDaoApi() {
  try {
    console.log('=== TEST SIMPLE API DAO SPÉCIFIQUE ===');
    
    // Test avec curl pour éviter les problèmes de cache
    const { execSync } = require('child_process');
    
    console.log('\n--- Test avec curl ---');
    
    try {
      const curlCommand = 'curl -X GET http://localhost:3000/api/daos/34 -H "Content-Type: application/json"';
      console.log(`Commande: ${curlCommand}`);
      
      const output = execSync(curlCommand, { encoding: 'utf8', cwd: 'c:/Users/LENOVO/Desktop/dao-project' });
      console.log('Réponse curl:');
      console.log(output);
      
      // Parser la réponse
      try {
        const response = JSON.parse(output);
        console.log('\n--- Analyse de la réponse ---');
        console.log(`Success: ${response.success ? '✅' : '❌'}`);
        console.log(`Error: ${response.error || 'Aucune'}`);
        
        if (response.data) {
          console.log(`DAO ID: ${response.data.id}`);
          console.log(`Chef ID: ${response.data.chef_id || 'N/A'}`);
          console.log(`Chef projet: ${response.data.chef_projet || 'N/A'}`);
          
          const hasChef = response.data.chef_projet && response.data.chef_projet !== 'N/A';
          console.log(`Chef récupéré: ${hasChef ? '✅' : '❌'}`);
        }
      } catch (parseError) {
        console.log('❌ Erreur parsing JSON:', parseError.message);
      }
      
    } catch (curlError) {
      console.log('❌ Erreur curl:', curlError.message);
    }
    
    console.log('\n--- Test avec fetch Node.js ---');
    
    try {
      const fetchResponse = await fetch('http://localhost:3000/api/daos/34');
      console.log(`Status fetch: ${fetchResponse.status} ${fetchResponse.ok ? '✅' : '❌'}`);
      
      const fetchText = await fetchResponse.text();
      console.log('Réponse fetch (brute):');
      console.log(fetchText.substring(0, 200) + '...');
      
      try {
        const fetchJson = JSON.parse(fetchText);
        console.log(`Success fetch: ${fetchJson.success ? '✅' : '❌'}`);
        console.log(`Error fetch: ${fetchJson.error || 'Aucune'}`);
      } catch (fetchParseError) {
        console.log('❌ Erreur parsing fetch JSON:', fetchParseError.message);
      }
      
    } catch (fetchError) {
      console.log('❌ Erreur fetch:', fetchError.message);
    }
    
    console.log('\n=== DIAGNOSTIC ===');
    console.log('Si l\'API retourne "ID de DAO requis":');
    console.log('1. Le serveur n\'a pas redémarré après les modifications');
    console.log('2. Problème avec les params Promise dans Next.js 15');
    console.log('3. L\'API n\'est pas correctement déployée');
    console.log('');
    console.log('Solutions:');
    console.log('- Redémarrer le serveur: npm run dev');
    console.log('- Vérifier les logs du serveur');
    console.log('- Tester avec un autre ID de DAO');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testSimpleDaoApi();
