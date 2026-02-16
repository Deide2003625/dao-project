// Test pour vérifier pourquoi les chefs ne se chargent pas lors de la création d'un DAO
async function testUsersApi() {
  console.log('=== TEST API USERS POUR CRÉATION DAO ===');
  
  try {
    console.log('\n--- Étape 1: Vérification du serveur ---');
    
    const serverResponse = await fetch('http://localhost:3000/api/daos');
    const serverOk = serverResponse.ok;
    
    console.log(`Serveur sur port 3000: ${serverOk ? '✅ Actif' : '❌ Inactif'}`);
    
    if (!serverOk) {
      console.log('❌ Le serveur ne répond pas');
      return;
    }
    
    console.log('\n--- Étape 2: Test de l\'API Users ---');
    
    // Test de l'API Users avec URL relative
    console.log('🔍 Test API Users (URL relative):');
    try {
      const usersResponse = await fetch('/api/users');
      console.log(`   Status: ${usersResponse.status} ${usersResponse.ok ? '✅' : '❌'} ${usersResponse.statusText}`);
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log(`   Données: ${usersData.success ? '✅' : '❌'} ${usersData.data ? `${usersData.data.length} utilisateurs` : '0 utilisateur'}`);
        
        if (usersData.data && usersData.data.length > 0) {
          const firstUser = usersData.data[0];
          console.log(`   Premier utilisateur: ID ${firstUser.id}, Username: ${firstUser.username || 'N/A'}, Role: ${firstUser.role || 'N/A'}`);
          
          // Vérifier les rôles
          const roles = [...new Set(usersData.data.map(u => u.role || u.roleName))];
          console.log(`   Rôles trouvés: ${roles.join(', ')}`);
          
          // Vérifier les chefs (rôles 2 et 3)
          const chefs = usersData.data.filter(u => {
            const roleId = String(u.role_id || u.role);
            return roleId === '2' || roleId === '3';
          });
          console.log(`   Chefs trouvés: ${chefs.length}`);
          
          if (chefs.length > 0) {
            console.log('   Liste des chefs:');
            chefs.forEach((chef, index) => {
              console.log(`     ${index + 1}. ID: ${chef.id}, Username: ${chef.username || 'N/A'}, Role: ${chef.role || 'N/A'}`);
            });
          }
        }
      } else {
        const errorText = await usersResponse.text();
        console.log(`   ❌ Erreur: ${errorText.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`   ❌ Erreur réseau: ${error.message}`);
    }
    
    // Test de l'API Users avec URL absolue
    console.log('\n🔍 Test API Users (URL absolue):');
    try {
      const usersResponse = await fetch('http://localhost:3000/api/users');
      console.log(`   Status: ${usersResponse.status} ${usersResponse.ok ? '✅' : '❌'} ${usersResponse.statusText}`);
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        console.log(`   Données: ${usersData.success ? '✅' : '❌'} ${usersData.data ? `${usersData.data.length} utilisateurs` : '0 utilisateur'}`);
        
        if (usersData.data && usersData.data.length > 0) {
          const firstUser = usersData.data[0];
          console.log(`   Premier utilisateur: ID ${firstUser.id}, Username: ${firstUser.username || 'N/A'}, Role: ${firstUser.role || 'N/A'}`);
          
          // Vérifier les rôles
          const roles = [...new Set(usersData.data.map(u => u.role || u.roleName))];
          console.log(`   Rôles trouvés: ${roles.join(', ')}`);
          
          // Vérifier les chefs (rôles 2 et 3)
          const chefs = usersData.data.filter(u => {
            const roleId = String(u.role_id || u.role);
            return roleId === '2' || roleId === '3';
          });
          console.log(`   Chefs trouvés: ${chefs.length}`);
          
          if (chefs.length > 0) {
            console.log('   Liste des chefs:');
            chefs.forEach((chef, index) => {
              console.log(`     ${index + 1}. ID: ${chef.id}, Username: ${chef.username || 'N/A'}, Role: ${chef.role || 'N/A'}`);
            });
          }
        }
      } else {
        const errorText = await usersResponse.text();
        console.log(`   ❌ Erreur: ${errorText.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`   ❌ Erreur réseau: ${error.message}`);
    }
    
    console.log('\n--- Étape 3: Vérification du fichier API Users ---');
    
    const fs = require('fs');
    const apiUsersPath = 'c:/Users/LENOVO/Desktop/dao-project/app/api/users/route.ts';
    
    console.log('📁 Fichier API Users:');
    console.log(`   /api/users/route.ts: ${fs.existsSync(apiUsersPath) ? '✅ Existe' : '❌ Manquant'}`);
    
    if (fs.existsSync(apiUsersPath)) {
      console.log('\n📄 Contenu de /api/users/route.ts:');
      const content = fs.readFileSync(apiUsersPath, 'utf8');
      console.log(content.substring(0, 300) + '...');
    }
    
    console.log('\n--- Étape 4: Test de la base de données ---');
    
    try {
      const connection = await require('mysql2/promise').createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'dao'
      });
      
      // Vérifier si la table users existe
      const [tables] = await connection.execute('SHOW TABLES LIKE \'%users%\'');
      console.log('📋 Tables trouvées:');
      tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table}`);
      });
      
      // Vérifier la structure de la table users
      try {
        const [columns] = await connection.execute('DESCRIBE users');
        console.log('\n📊 Structure de la table users:');
        columns.forEach((column, index) => {
          console.log(`   ${index + 1}. ${column.Field} - ${column.Type} - ${column.Null} - ${column.Key} - ${column.Default}`);
        });
        
        // Vérifier les données dans la table
        const [rows] = await connection.execute('SELECT * FROM users LIMIT 10');
        console.log('\n📊 Données dans la table users:');
        rows.forEach((row, index) => {
          console.log(`   ${index + 1}. ID: ${row.id}, Username: ${row.username || 'N/A'}, Role: ${row.role || 'N/A'}, Role_ID: ${row.role_id || 'N/A'}`);
        });
        
        // Vérifier les chefs spécifiquement
        const [chefs] = await connection.execute('SELECT * FROM users WHERE role_id IN (2, 3) OR role IN (2, 3)');
        console.log('\n📊 Chefs dans la table users:');
        chefs.forEach((chef, index) => {
          console.log(`   ${index + 1}. ID: ${chef.id}, Username: ${chef.username || 'N/A'}, Role: ${chef.role || 'N/A'}, Role_ID: ${chef.role_id || 'N/A'}`);
        });
        
        await connection.end();
        
      } catch (error) {
        console.log('❌ Erreur table users:', error.message);
      }
      
    } catch (error) {
      console.log('❌ Erreur base de données:', error.message);
    }
    
    console.log('\n--- Étape 5: Test de la page de création DAO ---');
    
    const createDaoUrl = 'http://localhost:3000/dash/admin/CreateDao';
    console.log(`🌐 URL testée: ${createDaoUrl}`);
    
    try {
      const createDaoResponse = await fetch(createDaoUrl);
      console.log(`Page création DAO: ${createDaoResponse.ok ? '✅ Accessible' : '❌ Erreur ' + createDaoResponse.status}`);
      
      if (createDaoResponse.ok) {
        const html = await createDaoResponse.text();
        
        // Vérifier si la page contient les éléments de sélection de chefs
        const hasChefSelect = html.includes('chefEquipe') || html.includes('Chef d\'équipe');
        const hasUsersData = html.includes('teamLeaders') || html.includes('Chefs d\'équipe');
        
        console.log(`🔍 Vérification du contenu:`);
        console.log(`   Sélection chef: ${hasChefSelect ? '✅' : '❌'}`);
        console.log(`   Données chefs: ${hasUsersData ? '✅' : '❌'}`);
        
        if (!hasChefSelect) {
          console.log('❌ Le sélecteur de chef n\'est pas présent dans la page');
        }
        
        if (!hasUsersData) {
          console.log('❌ Les données des chefs ne sont pas chargées');
        }
      }
    } catch (error) {
      console.log('❌ Erreur page création DAO:', error.message);
    }
    
    console.log('\n=== RÉSULTAT FINAL ===');
    console.log('🎯 Diagnostic du problème de chargement des chefs:');
    console.log(`   Serveur: ${serverOk ? '✅ Actif' : '❌ Inactif'}`);
    console.log(`   API Users: ${usersResponse ? '✅ Testée' : '❌ Non testée'}`);
    console.log(`   Page création: ${createDaoResponse ? '✅ Testée' : '❌ Non testée'}`);
    console.log('');
    console.log('🔧 Problèmes identifiés:');
    console.log('   - URL relative dans le fetch: /api/users');
    console.log('   - API Users peut ne pas exister');
    console.log('   - Base de données peut ne pas avoir de données');
    console.log('   - Filtrage des rôles peut être incorrect');
    
    console.log('\n--- Étape 6: Solutions recommandées ---');
    
    console.log('🔧 Solutions immédiates:');
    console.log('   1. Vérifier si l\'API /api/users existe');
    console.log('   2. Corriger l\'URL relative en URL absolue: http://localhost:3000/api/users');
    console.log('   3. Vérifier les données dans la table users');
    console.log('   4. Corriger le filtrage des rôles si nécessaire');
    console.log('   5. Tester la page de création DAO');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testUsersApi();
