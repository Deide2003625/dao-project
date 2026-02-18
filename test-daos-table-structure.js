// Vérification de la structure de la table daos
async function checkDaosTableStructure() {
  try {
    console.log('=== VÉRIFICATION STRUCTURE TABLE DAOS ===');
    
    const connection = await require('mysql2/promise').createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'dao'
    });
    
    console.log('\n--- Étape 1: Structure de la table daos ---');
    
    const [columns] = await connection.execute('DESCRIBE daos');
    console.log('📊 Colonnes de la table daos:');
    columns.forEach((column, index) => {
      console.log(`   ${index + 1}. ${column.Field} - ${column.Type} - ${column.Null} - ${column.Key} - ${column.Default || 'NULL'}`);
    });
    
    console.log('\n--- Étape 2: Vérification des colonnes importantes ---');
    
    const hasChefId = columns.some(col => col.Field === 'chef_id');
    const hasChefProjet = columns.some(col => col.Field === 'chef_projet');
    const hasTeamId = columns.some(col => col.Field === 'team_id');
    
    console.log(`chef_id: ${hasChefId ? '✅' : '❌'}`);
    console.log(`chef_projet: ${hasChefProjet ? '✅' : '❌'}`);
    console.log(`team_id: ${hasTeamId ? '✅' : '❌'}`);
    
    console.log('\n--- Étape 3: Données existantes ---');
    
    const [sampleData] = await connection.execute('SELECT * FROM daos LIMIT 3');
    console.log('📊 Exemples de données dans daos:');
    sampleData.forEach((row, index) => {
      console.log(`   ${index + 1}. ID: ${row.id}`);
      console.log(`      chef_id: ${row.chef_id || 'NULL'}`);
      console.log(`      team_id: ${row.team_id || 'NULL'}`);
      console.log(`      reference: ${row.reference || 'NULL'}`);
    });
    
    console.log('\n--- Étape 4: Diagnostic ---');
    
    if (!hasChefId) {
      console.log('❌ La table daos n\'a pas de colonne chef_id');
      console.log('   L\'API POST essaie d\'insérer chef_id mais la colonne n\'existe pas');
    }
    
    if (hasChefId && !hasChefProjet) {
      console.log('✅ La table a chef_id mais pas chef_projet');
      console.log('   L\'API GET doit faire le LEFT JOIN pour récupérer chef_projet');
      console.log('   L\'API POST doit insérer chef_id (déjà fait)');
    }
    
    if (hasTeamId) {
      console.log('✅ La table a team_id (pour les équipes)');
    }
    
    console.log('\n--- Étape 5: Solution recommandée ---');
    
    if (hasChefId) {
      console.log('🔧 La structure est correcte pour chef_id');
      console.log('   L\'API POST insère chef_id: ✅');
      console.log('   L\'API GET doit utiliser LEFT JOIN: ✅');
      console.log('   Le problème est ailleurs (cache, rafraîchissement, etc.)');
    } else {
      console.log('❌ La table daos n\'a pas la colonne chef_id');
      console.log('   Il faut ajouter la colonne chef_id à la table');
    }
    
    await connection.end();
    
    console.log('\n=== CONCLUSION ===');
    console.log('Le problème chef_projet qui ne s\'affiche pas vient de:');
    console.log('1. Table daos sans colonne chef_id ?');
    console.log('2. LEFT JOIN incorrect dans l\'API GET ?');
    console.log('3. Cache du navigateur ?');
    console.log('4. Page non rafraîchie après création ?');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkDaosTableStructure();
