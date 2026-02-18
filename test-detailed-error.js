// Test pour voir l'erreur détaillée
async function testDetailedError() {
  try {
    console.log('=== TEST ERREUR DÉTAILLÉE ===');
    
    const testId = '40';
    const url = `http://localhost:3000/api/daos/${testId}`;
    
    console.log(`Test avec: ${url}`);
    
    const response = await fetch(url, { cache: "no-store" });
    const json = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, json);
    
    if (response.status === 500 && json.details) {
      console.log('\n🔍 ERREUR DÉTAILLÉE TROUVÉE:');
      console.log(`Message: ${json.details}`);
      console.log(`DAO ID: ${json.daoId}`);
      console.log(`Type: ${json.errorType || 'Non spécifié'}`);
      
      console.log('\n🔧 ACTIONS RECOMMANDÉES:');
      if (json.details.includes('db') || json.details.includes('connection')) {
        console.log('- Problème de connexion à la base de données');
        console.log('- Vérifier la configuration de la base');
      } else if (json.details.includes('SQL') || json.details.includes('syntax')) {
        console.log('- Problème de syntaxe SQL');
        console.log('- Vérifier la requête SQL');
      } else if (json.details.includes('params') || json.details.includes('await')) {
        console.log('- Problème avec les params Next.js');
        console.log('- Vérifier la gestion des params asynchrones');
      } else {
        console.log('- Erreur inattendue, vérifier les logs du serveur');
      }
    }
    
  } catch (error) {
    console.error('Erreur de test:', error.message);
  }
}

testDetailedError();
