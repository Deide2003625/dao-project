// Test pour diagnostiquer pourquoi les chefs affichent '-' au lieu de leur nom
async function diagnoseChefDashDisplay() {
  try {
    console.log('=== DIAGNOSTIC CHEF AFFICHAGE "-" ===');
    
    console.log('\n--- Étape 1: Vérification des données API ---');
    
    const response = await fetch("http://localhost:3000/api/dao", { cache: "no-store" });
    console.log(`Status API: ${response.ok ? '✅' : '❌'} ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Erreur API: ${errorText}`);
      return;
    }
    
    const data = await response.json();
    console.log(`Nombre de DAOs: ${data.data ? data.data.length : 0}`);
    
    if (data.data && data.data.length > 0) {
      console.log('\n--- Étape 2: Analyse détaillée des chefs ---');
      
      let daosWithChefName = 0;
      let daosWithDash = 0;
      let daosWithNull = 0;
      let daosWithEmpty = 0;
      
      data.data.forEach((dao, index) => {
        const chefValue = dao.chef_projet;
        
        console.log(`\nDAO ${index + 1} (${dao.numero}):`);
        console.log(`  ID: ${dao.id}`);
        console.log(`  chef_id: ${dao.chef_id || 'NULL'}`);
        console.log(`  chef_projet: "${chefValue}"`);
        console.log(`  Type: ${typeof chefValue}`);
        console.log(`  Longueur: ${chefValue ? chefValue.length : 'N/A'}`);
        
        // Analyse de la valeur
        if (chefValue === null || chefValue === undefined) {
          daosWithNull++;
          console.log(`  ❌ NULL/UNDEFINED`);
        } else if (chefValue === '') {
          daosWithEmpty++;
          console.log(`  ❌ CHAÎNE VIDE`);
        } else if (chefValue === '-' || chefValue === ' - ' || chefValue === '—') {
          daosWithDash++;
          console.log(`  ❌ TRAIT '-' DÉTECTÉ`);
        } else {
          daosWithChefName++;
          console.log(`  ✅ NOM VALIDE: "${chefValue}"`);
        }
        
        // Vérifier les caractères spéciaux
        if (chefValue && typeof chefValue === 'string') {
          const hasSpecialChars = /[^\w\s\-]/.test(chefValue);
          const isOnlyDash = /^[-—\s]*$/.test(chefValue);
          
          console.log(`  Caractères spéciaux: ${hasSpecialChars ? '✅' : '❌'}`);
          console.log(`  Uniquement des traits: ${isOnlyDash ? '✅' : '❌'}`);
          
          if (isOnlyDash) {
            console.log(`  🔍 Analyse du trait: "${chefValue}"`);
            console.log(`     Code ASCII: ${Array.from(chefValue).map(c => c.charCodeAt(0)).join(', ')}`);
          }
        }
      });
      
      console.log(`\n📊 Résumé analyse:`);
      console.log(`   DAOs avec nom valide: ${daosWithChefName}`);
      console.log(`   DAOs avec trait '-': ${daosWithDash}`);
      console.log(`   DAOs avec NULL: ${daosWithNull}`);
      console.log(`   DAOs avec vide: ${daosWithEmpty}`);
      
      if (daosWithDash > 0) {
        console.log(`\n❌ Problème identifié: ${daosWithDash} DAOs affichent '-'`);
        
        // Analyser les DAOs avec des traits
        const dashDaos = data.data.filter(dao => 
          dao.chef_projet === '-' || 
          dao.chef_projet === ' - ' || 
          dao.chef_projet === '—' ||
          (dao.chef_projet && /^[-—\s]*$/.test(dao.chef_projet))
        );
        
        console.log('\n🔍 DAOs avec des traits:');
        dashDaos.forEach((dao, index) => {
          console.log(`  ${index + 1}. DAO ${dao.numero} (ID: ${dao.id})`);
          console.log(`     chef_id: ${dao.chef_id || 'NULL'}`);
          console.log(`     chef_projet: "${dao.chef_projet}"`);
          console.log(`     Type: ${typeof dao.chef_projet}`);
          
          // Vérifier si l'utilisateur existe dans la table users
          if (dao.chef_id) {
            console.log(`     🔍 Vérification utilisateur ID ${dao.chef_id}...`);
          }
        });
      }
    }
    
    console.log('\n--- Étape 3: Vérification directe dans la base ---');
    
    const connection = await require('mysql2/promise').createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'dao'
    });
    
    // Vérifier le LEFT JOIN directement
    const [directJoin] = await connection.execute(`
      SELECT 
        d.id,
        d.numero,
        d.chef_id,
        u.username as chef_projet,
        u.id as user_exists
      FROM daos d
      LEFT JOIN users u ON d.chef_id = u.id
      WHERE d.id IN (SELECT id FROM daos ORDER BY created_at DESC LIMIT 5)
      ORDER BY d.created_at DESC
    `);
    
    console.log('\n📊 Vérification LEFT JOIN direct:');
    directJoin.forEach((row, index) => {
      console.log(`  ${index + 1}. DAO ${row.numero}:`);
      console.log(`     chef_id: ${row.chef_id || 'NULL'}`);
      console.log(`     chef_projet: "${row.chef_projet || 'NULL'}"`);
      console.log(`     user_exists: ${row.user_exists || 'NULL'}`);
      console.log(`     JOIN réussi: ${row.chef_id && row.chef_projet ? '✅' : '❌'}`);
      
      if (row.chef_id && !row.chef_projet) {
        console.log(`     ❌ L'utilisateur ${row.chef_id} n'existe pas dans la table users !`);
      }
    });
    
    await connection.end();
    
    console.log('\n--- Étape 4: Diagnostic du problème ---');
    
    console.log('🔍 Causes possibles des traits "-":');
    console.log('1. LEFT JOIN ne trouve pas l\'utilisateur (user inexistant)');
    console.log('2. username est NULL dans la table users');
    console.log('3. Problème de conversion de type');
    console.log('4. Affichage par défaut quand chef_projet est vide');
    console.log('5. Problème dans le composant React');
    
    console.log('\n🔧 Solutions recommandées:');
    console.log('1. Vérifier que tous les chef_id existent dans users');
    console.log('2. Ajouter une valeur par défaut dans le LEFT JOIN');
    console.log('3. Corriger le composant React pour gérer les NULL');
    console.log('4. Ajouter des logs dans l\'API pour debug');
    
    console.log('\n=== CONCLUSION ===');
    console.log('🎯 État final:');
    console.log('- Si des traits sont affichés, c\'est que le LEFT JOIN ne trouve pas les utilisateurs');
    console.log('- La solution est de vérifier la cohérence des ID entre daos.chef_id et users.id');
    console.log('- Ou d\'ajouter une gestion des NULL dans le composant React');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

diagnoseChefDashDisplay();
