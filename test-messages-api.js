const mysql = require('mysql2/promise');

async function testMessagesAPI() {
  try {
    console.log('=== TEST API MESSAGES ===');
    
    // Test de l'API GET pour récupérer les messages
    console.log('\n--- Test GET /api/messages ---');
    
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
      
      console.log('\n📋 Détails des messages:');
      json.data.forEach((msg, index) => {
        console.log(`  ${index + 1}. ID=${msg.id}`);
        console.log(`     Contenu: ${msg.content}`);
        console.log(`     Utilisateur: ${msg.user_name}`);
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

testMessagesAPI();
