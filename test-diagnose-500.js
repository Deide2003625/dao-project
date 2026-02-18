// Test pour diagnostiquer l'erreur 500 dans l'API GET spécifique
async function diagnose500Error() {
  try {
    console.log('=== DIAGNOSTIC ERREUR 500 API DAO SPÉCIFIQUE ===');
    
    console.log('\n--- Étape 1: Test de connexion à la base ---');
    
    try {
      const connection = await require('mysql2/promise').createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'dao'
      });
      
      console.log('✅ Connexion base réussie');
      
      // Test de la table users
      const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
      console.log(`📊 Table users: ${users[0].count} enregistrements`);
      
      // Test de la table daos
      const [daos] = await connection.execute('SELECT COUNT(*) as count FROM daos');
      console.log(`📊 Table daos: ${daos[0].count} enregistrements`);
      
      // Test du LEFT JOIN manuel
      console.log('\n--- Test du LEFT JOIN manuel ---');
      const [joinTest] = await connection.execute(`
        SELECT 
          d.id,
          d.chef_id,
          u.username as chef_projet
        FROM daos d
        LEFT JOIN users u ON d.chef_id = u.id
        WHERE d.id = 34
        LIMIT 1
      `);
      
      if (joinTest.length > 0) {
        const result = joinTest[0];
        console.log('✅ LEFT JOIN manuel réussi:');
        console.log(`   DAO ID: ${result.id}`);
        console.log(`   chef_id: ${result.chef_id}`);
        console.log(`   chef_projet: ${result.chef_projet}`);
      } else {
        console.log('❌ LEFT JOIN manuel échoué');
      }
      
      await connection.end();
      
    } catch (dbError) {
      console.error('❌ Erreur connexion base:', dbError.message);
    }
    
    console.log('\n--- Étape 2: Test de l\'API GET avec logs ---');
    
    try {
      const response = await fetch('http://localhost:3000/api/daos/34');
      console.log(`Status: ${response.status} ${response.ok ? '✅' : '❌'}`);
      
      const text = await response.text();
      console.log('Réponse brute:', text.substring(0, 500));
      
      try {
        const json = JSON.parse(text);
        console.log('JSON parsé:', JSON.stringify(json, null, 2));
      } catch (parseError) {
        console.log('❌ Erreur parsing JSON:', parseError.message);
      }
      
    } catch (fetchError) {
      console.error('❌ Erreur fetch:', fetchError.message);
    }
    
    console.log('\n--- Étape 3: Vérification des logs serveur ---');
    
    console.log('🔍 Actions recommandées:');
    console.log('1. Vérifier les logs du serveur Next.js');
    console.log('2. Chercher les erreurs SQL dans les logs');
    console.log('3. Vérifier la console du navigateur');
    console.log('4. Tester avec un autre ID de DAO');
    console.log('5. Vérifier la connexion à la base');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

diagnose500Error();
