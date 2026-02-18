// Test direct de l'API pour vérifier si elle fonctionne
async function testApiDirect() {
  try {
    console.log('=== TEST DIRECT API /api/daos/[id] ===');
    
    // Tester avec un ID connu
    const testId = '34';
    const url = `http://localhost:3000/api/daos/${testId}`;
    
    console.log(`\n--- Test avec l'URL: ${url} ---`);
    
    const response = await fetch(url, { cache: "no-store" });
    console.log(`Status: ${response.status} ${response.ok ? '✅' : '❌'}`);
    
    const json = await response.json().catch(() => ({}));
    console.log(`Réponse:`, json);
    
    if (response.ok && json.data) {
      console.log('✅ API fonctionne correctement:');
      console.log(`  ID: ${json.data.id}`);
      console.log(`  Numero: ${json.data.numero}`);
      console.log(`  Chef: ${json.data.chef_projet || 'N/A'}`);
    } else {
      console.log('❌ API ne fonctionne pas:');
      console.log(`  Status: ${response.status}`);
      console.log(`  Réponse:`, json);
      
      if (response.status === 500) {
        console.log('\n🔍 Erreur 500 - Causes possibles:');
        console.log('1. Serveur n\'a pas redémarré après les modifications');
        console.log('2. Problème de connexion à la base de données');
        console.log('3. Erreur dans le code de l\'API');
      } else if (response.status === 404) {
        console.log('\n🔍 Erreur 404 - Causes possibles:');
        console.log('1. DAO avec cet ID n\'existe pas');
        console.log('2. Route API non trouvée');
      } else if (Object.keys(json).length === 0) {
        console.log('\n🔍 Réponse vide - Causes possibles:');
        console.log('1. Erreur dans l\'API non capturée');
        console.log('2. Problème de format de réponse');
      }
    }
    
    console.log('\n--- Test avec un autre ID ---');
    const testId2 = '37';
    const url2 = `http://localhost:3000/api/daos/${testId2}`;
    
    const response2 = await fetch(url2, { cache: "no-store" });
    console.log(`Status: ${response2.status} ${response2.ok ? '✅' : '❌'}`);
    
    const json2 = await response2.json().catch(() => ({}));
    console.log(`Réponse:`, json2);
    
    console.log('\n=== CONCLUSION ===');
    console.log('🔧 Actions recommandées:');
    console.log('1. Redémarrer le serveur Next.js (Ctrl+C puis npm run dev)');
    console.log('2. Vider le cache Next.js (supprimer dossier .next)');
    console.log('3. Vérifier les logs du serveur pour voir les erreurs');
    console.log('4. Tester l\'API générale /api/dao pour comparaison');
    
  } catch (error) {
    console.error('❌ Erreur test API:', error.message);
  }
}

testApiDirect();
