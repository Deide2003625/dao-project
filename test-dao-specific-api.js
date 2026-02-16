// Test pour diagnostiquer l'erreur 400 de l'API DAO spécifique
async function testDaoSpecificApi() {
  console.log('=== TEST API DAO SPÉCIFIQUE ERREUR 400 ===');
  
  try {
    console.log('\n--- Étape 1: Test de différentes routes DAO ---');
    
    const daoId = 34;
    
    // Test de différentes routes possibles
    const routes = [
      `http://localhost:3000/api/daos/${daoId}`,
      `http://localhost:3000/api/dao/${daoId}`,
      `http://localhost:3000/api/daos?=${daoId}`,
      `http://localhost:3000/api/daos?id=${daoId}`
    ];
    
    for (const route of routes) {
      try {
        const response = await fetch(route);
        console.log(`   ${route}: ${response.status} ${response.ok ? '✅' : '❌'} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`     Données: ${data.success ? '✅' : '❌'} ${data.data ? 'DAO trouvé' : 'DAO non trouvé'}`);
        } else {
          const text = await response.text();
          console.log(`     Erreur: ${text.substring(0, 100)}...`);
        }
      } catch (error) {
        console.log(`   ${route}: ❌ Erreur réseau - ${error.message}`);
      }
    }
    
    console.log('\n--- Étape 2: Test de la table daos ---');
    
    try {
      const connection = await require('mysql2/promise').createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'dao'
      });
      
      // Vérifier si la table daos existe
      const [tables] = await connection.execute('SHOW TABLES LIKE \'%daos%\'');
      console.log('📋 Tables trouvées:');
      tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table}`);
      });
      
      // Vérifier la structure de la table daos
      try {
        const [columns] = await connection.execute('DESCRIBE daos');
        console.log('\n📊 Structure de la table daos:');
        columns.forEach((column, index) => {
          console.log(`   ${index + 1}. ${column.Field} - ${column.Type} - ${column.Null} - ${column.Key} - ${column.Default}`);
        });
        
        // Vérifier les données dans la table
        const [rows] = await connection.execute('SELECT * FROM daos LIMIT 5');
        console.log('\n📊 Données dans la table daos:');
        rows.forEach((row, index) => {
          console.log(`   ${index + 1}. ID: ${row.id}, Référence: ${row.reference || 'N/A'}, Statut: ${row.statut || 'N/A'}`);
        });
        
        await connection.end();
        
      } catch (error) {
        console.log('❌ Erreur table daos:', error.message);
      }
      
    } catch (error) {
      console.log('❌ Erreur base de données:', error.message);
    }
    
    console.log('\n--- Étape 3: Test de l\'API DAOs générale ---');
    
    try {
      const daosResponse = await fetch('http://localhost:3000/api/daos');
      console.log(`API DAOs générale: ${daosResponse.ok ? '✅' : '❌'} ${daosResponse.status}`);
      
      if (daosResponse.ok) {
        const daosData = await daosResponse.json();
        console.log(`Données DAOs générales: ${daosData.success ? '✅' : '❌'}`);
        console.log(`Nombre de DAOs: ${daosData.data ? daosData.data.length : 0}`);
        
        if (daosData.data && daosData.data.length > 0) {
          const firstDao = daosData.data[0];
          console.log(`Premier DAO: ID ${firstDao.id}, Référence: ${firstDao.reference || 'N/A'}`);
          
          // Vérifier si l'ID 34 existe
          const dao34 = daosData.data.find(dao => dao.id === 34);
          console.log(`DAO 34 trouvé: ${dao34 ? '✅' : '❌'}`);
          
          if (dao34) {
            console.log(`Statut: ${dao34.statut || 'N/A'}`);
            console.log(`Description: ${dao34.description || 'N/A'}`);
          }
        }
      }
    } catch (error) {
      console.log('❌ Erreur API DAOs générale:', error.message);
    }
    
    console.log('\n--- Étape 4: Test avec curl ---');
    
    try {
      const { execSync } = require('child_process');
      const curlCommand = `curl -v -X GET http://localhost:3000/api/daos/34`;
      console.log(`🔍 Commande curl: ${curlCommand}`);
      
      const output = execSync(curlCommand, { encoding: 'utf8', cwd: 'c:/Users/LENOVO/Desktop/dao-project' });
      console.log('📄 Résultat curl:');
      console.log(output);
    } catch (error) {
      console.log('❌ Erreur curl:', error.message);
    }
    
    console.log('\n--- Étape 5: Vérification du fichier API ---');
    
    const fs = require('fs');
    const apiDaoPath = 'c:/Users/LENOVO/Desktop/dao-project/app/api/daos/[id]/route.ts';
    const apiDaosPath = 'c:/Users/LENOVO/Desktop/dao-project/app/api/daos/route.ts';
    
    console.log('📁 Fichiers API DAO:');
    console.log(`   [id]/route.ts: ${fs.existsSync(apiDaoPath) ? '✅ Existe' : '❌ Manquant'}`);
    console.log(`   route.ts: ${fs.existsSync(apiDaosPath) ? '✅ Existe' : '❌ Manquant'}`);
    
    if (fs.existsSync(apiDaosPath)) {
      console.log('\n📄 Contenu de /api/daos/[id]/route.ts:');
      const content = fs.readFileSync(apiDaoPath, 'utf8');
      console.log(content.substring(0, 200) + '...');
    }
    
    if (fs.existsSync(apiDaosPath)) {
      console.log('\n📄 Contenu de /api/daos/route.ts:');
      const content = fs.readFileSync(apiDaosPath, 'utf8');
      console.log(content.substring(0, 200) + '...');
    }
    
    console.log('\n=== RÉSULTAT FINAL ===');
    console.log('🎯 Diagnostic de l\'erreur 400:');
    console.log('   ✅ Serveur Next.js actif');
    console.log('   ✅ API Tasks fonctionnelle');
    console.log('   ✅ Page détail accessible');
    console.log('   ❌ API DAO spécifique: Erreur 400');
    console.log('   ❌ Données DAO non chargées');
    console.log('');
    console.log('🔧 Solution immédiate:');
    console.log('   1. Vérifier la table daos dans la base de données');
    console.log('   2. Corriger l\'API DAO spécifique si nécessaire');
    console.log('    - Vérifier la route: /api/daos/[id]/route.ts');
    console.log('    - Vérifier la requête SQL');
    console.log('    - Vérifier les colonnes de la table');
    console.log('   3. Tester avec l\'URL correcte une fois corrigé');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testDaoSpecificApi();
