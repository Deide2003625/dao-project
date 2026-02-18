const mysql = require('mysql2/promise');

async function testMessagesWithNames() {
  try {
    console.log('=== TEST MESSAGES AVEC NOMS ===');
    
    // Test des messages pour la tâche 1
    console.log('\n--- Test GET /api/messages?task_id=1 ---');
    
    const response = await fetch('http://localhost:3000/api/messages?task_id=1', { 
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status}`);
    
    const json = await response.json();
    console.log(`Response:`, json);
    
    if (response.ok && json.success && json.data) {
      console.log(`✅ ${json.data.length} messages trouvés pour la tâche 1`);
      
      console.log('\n📋 Détails des messages avec noms:');
      json.data.forEach((msg, index) => {
        console.log(`  ${index + 1}. ID=${msg.id}`);
        console.log(`     Contenu: ${msg.content}`);
        console.log(`     Utilisateur ID: ${msg.user_id}`);
        console.log(`     Nom utilisateur: ${msg.user_name || 'NON DÉFINI'}`);
        console.log(`     Public: ${msg.is_public ? 'Oui' : 'Non'}`);
        console.log(`     Destinataire: ${msg.mentioned_user_name || 'Aucun'}`);
        console.log(`     Créé le: ${msg.created_at}`);
        console.log('');
      });
      
    } else {
      console.log('❌ Erreur API messages:');
      console.log(`Status: ${response.status}`);
      console.log(`Response:`, json);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testMessagesWithNames();
