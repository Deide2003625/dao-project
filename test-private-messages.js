const mysql = require('mysql2/promise');

async function testPrivateMessages() {
  try {
    console.log('=== TEST DES MESSAGES PRIVÉS ===');
    
    // Créer un message privé de admin (41) pour lio (43)
    console.log('\n--- Création d\'un message privé de admin pour lio ---');
    
    const createResponse = await fetch('http://localhost:3000/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task_id: 1,
        user_id: 41, // admin
        content: 'Message privé pour @lio',
        mentioned_user_id: 43, // lio
        mentioned_user_name: 'lio',
        is_public: false
      }),
    });
    
    const createResult = await createResponse.json();
    console.log('Création message privé:', createResult);
    
    // Test avec admin (41) - ne devrait PAS voir le message privé pour lio
    console.log('\n--- Test GET /api/messages?user_id=41 (admin) ---');
    
    const adminResponse = await fetch('http://localhost:3000/api/messages?user_id=41', { 
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const adminData = await adminResponse.json();
    console.log(`Admin voit ${adminData.data?.length || 0} messages`);
    
    // Test avec lio (43) - devrait VOIR le message privé
    console.log('\n--- Test GET /api/messages?user_id=43 (lio) ---');
    
    const lioResponse = await fetch('http://localhost:3000/api/messages?user_id=43', { 
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const lioData = await lioResponse.json();
    console.log(`Lio voit ${lioData.data?.length || 0} messages`);
    
    if (lioData.data) {
      console.log('\n📋 Messages vus par lio:');
      lioData.data.forEach((msg, index) => {
        console.log(`  ${index + 1}. ID=${msg.id}`);
        console.log(`     Expéditeur: ${msg.user_name} (ID: ${msg.user_id})`);
        console.log(`     Contenu: ${msg.content}`);
        console.log(`     Public: ${msg.is_public ? 'Oui' : 'Non'}`);
        console.log(`     Destinataire: ${msg.mentioned_user_name || 'Aucun'}`);
        console.log('');
      });
    }
    
    // Test avec user1 (45) - ne devrait PAS voir le message privé
    console.log('\n--- Test GET /api/messages?user_id=45 (user1) ---');
    
    const user1Response = await fetch('http://localhost:3000/api/messages?user_id=45', { 
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const user1Data = await user1Response.json();
    console.log(`User1 voit ${user1Data.data?.length || 0} messages`);
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testPrivateMessages();
