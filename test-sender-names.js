const mysql = require('mysql2/promise');

async function testSenderNames() {
  try {
    console.log('=== TEST NOMS EXPÉDITEURS ===');
    
    // Récupérer tous les messages avec leurs noms
    console.log('\n--- Tous les messages avec noms d\'expéditeurs ---');
    
    const response = await fetch('http://localhost:3000/api/messages?task_id=1', { 
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const json = await response.json();
    
    if (json.success && json.data) {
      console.log(`✅ ${json.data.length} messages trouvés pour la tâche 1`);
      
      console.log('\n📋 Détails des messages avec noms d\'expéditeurs:');
      json.data.forEach((msg, index) => {
        console.log(`  ${index + 1}. ID=${msg.id}`);
        console.log(`     Contenu: ${msg.content}`);
        console.log(`     Expéditeur ID: ${msg.user_id}`);
        console.log(`     Nom expéditeur (API): ${msg.user_name}`);
        console.log(`     Public: ${msg.is_public ? 'Oui' : 'Non'}`);
        console.log(`     Destinataire: ${msg.mentioned_user_name || 'Aucun'}`);
        console.log('');
      });
      
    } else {
      console.log('❌ Erreur API messages');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testSenderNames();
