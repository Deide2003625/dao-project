// Test complet du backend pour diagnostiquer le problème
async function testBackendComplete() {
  console.log('=== DIAGNOSTIC COMPLET BACKEND ===');
  
  try {
    // 1. Tester l'API générale (fonctionne)
    console.log('\n--- 1. Test API générale /api/dao ---');
    const generalResponse = await fetch('http://localhost:3000/api/dao', { cache: "no-store" });
    console.log(`Status: ${generalResponse.status}`);
    
    if (generalResponse.ok) {
      const generalData = await generalResponse.json();
      console.log(`✅ API générale fonctionne: ${generalData.data?.length || 0} DAOs`);
      
      if (generalData.data && generalData.data.length > 0) {
        const firstDao = generalData.data[0];
        console.log(`Premier DAO: ID=${firstDao.id}, Numero=${firstDao.numero}`);
        
        // 2. Tester l'API spécifique avec cet ID
        console.log(`\n--- 2. Test API spécifique /api/daos/${firstDao.id} ---`);
        await testSpecificApi(firstDao.id);
      }
    } else {
      console.log('❌ API générale ne fonctionne pas');
    }
    
    // 3. Tester avec plusieurs IDs
    console.log('\n--- 3. Test avec plusieurs IDs ---');
    const testIds = ['34', '37', '39', '40'];
    for (const id of testIds) {
      await testSpecificApi(id);
    }
    
    // 4. Tester la connexion à la base de données
    console.log('\n--- 4. Test connexion base de données ---');
    await testDatabaseConnection();
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

async function testSpecificApi(daoId) {
  try {
    const url = `http://localhost:3000/api/daos/${daoId}`;
    console.log(`Test URL: ${url}`);
    
    const response = await fetch(url, { 
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Script'
      }
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    const text = await response.text();
    console.log(`Response text:`, text);
    
    let json;
    try {
      json = JSON.parse(text);
      console.log(`Parsed JSON:`, json);
    } catch (parseError) {
      console.log(`❌ JSON parse error:`, parseError.message);
      return;
    }
    
    if (response.ok && json.data) {
      console.log('✅ Succès - DAO trouvé:');
      console.log(`  ID: ${json.data.id}`);
      console.log(`  Numero: ${json.data.numero}`);
      console.log(`  Chef: ${json.data.chef_projet || 'N/A'}`);
    } else {
      console.log('❌ Erreur API:');
      console.log(`  Status: ${response.status}`);
      console.log(`  Response:`, json);
      
      if (response.status === 500) {
        console.log('\n🔍 Détails erreur 500:');
        console.log('  - Erreur interne du serveur');
        console.log('  - Problème dans le code de l\'API');
        console.log('  - Possible: connexion DB, syntaxe SQL, await params');
      }
    }
    
  } catch (fetchError) {
    console.log(`❌ Erreur fetch:`, fetchError.message);
  }
}

async function testDatabaseConnection() {
  try {
    console.log('Test de connexion à la base de données...');
    
    // Simuler la connexion comme dans l'API
    const db = require('@/lib/db');
    const connection = await db();
    
    console.log('✅ Connexion DB établie');
    
    // Test simple query
    const [result] = await connection.execute('SELECT COUNT(*) as count FROM daos');
    console.log(`✅ Nombre de DAOs dans la base: ${result[0].count}`);
    
    // Test query avec LEFT JOIN
    const [daos] = await connection.execute(`
      SELECT 
        d.id,
        d.numero,
        d.chef_id,
        u.username as chef_projet
      FROM daos d
      LEFT JOIN users u ON d.chef_id = u.id
      LIMIT 5
    `);
    
    console.log('✅ Test LEFT JOIN réussi:');
    daos.forEach((dao, index) => {
      console.log(`  ${index + 1}. ID=${dao.id}, Numero=${dao.numero}, Chef=${dao.chef_projet || 'NULL'}`);
    });
    
    await connection.end();
    console.log('✅ Connexion DB fermée');
    
  } catch (dbError) {
    console.error('❌ Erreur base de données:', dbError.message);
    console.error('Stack:', dbError.stack);
  }
}

// Exécuter le test
testBackendComplete();
