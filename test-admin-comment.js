const mysql = require('mysql2/promise');

async function testAdminComment() {
  try {
    console.log('=== TEST ENVOI COMMENTAIRE ADMIN ===');
    
    // Simuler l'envoi d'un commentaire par l'admin (ID 41)
    console.log('\n--- Envoi d\'un commentaire par l\'admin (ID 41) ---');
    
    const createResponse = await fetch('http://localhost:3000/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task_id: 1,
        user_id: 41, // Admin avec le bon ID
        content: 'Commentaire test admin depuis modal',
        mentioned_user_id: null,
        mentioned_user_name: null,
        is_public: true
      }),
    });
    
    const createResult = await createResponse.json();
    console.log('Envoi commentaire:', createResult);
    
    if (createResult.success) {
      const messageId = createResult.data.id;
      console.log(`✅ Commentaire envoyé avec ID: ${messageId}`);
      
      // Vérifier que l'admin ne voit pas son propre message dans le header
      console.log('\n--- Vérification header admin (ID 41) ---');
      
      const headerResponse = await fetch('http://localhost:3000/api/messages?user_id=41', { 
        cache: "no-store",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const headerData = await headerResponse.json();
      
      if (headerData.success) {
        const adminMessage = headerData.data.find(m => m.id === messageId);
        
        if (adminMessage) {
          console.log('❌ L\'admin voit son propre message dans le header (ERREUR)');
        } else {
          console.log('✅ L\'admin ne voit pas son propre message dans le header (CORRECT)');
        }
        
        console.log(`Messages dans header admin: ${headerData.data.length}`);
      }
      
      // Vérifier que user1 voit le message de l'admin
      console.log('\n--- Vérification header user1 (ID 45) ---');
      
      const user1Response = await fetch('http://localhost:3000/api/messages?user_id=45', { 
        cache: "no-store",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const user1Data = await user1Response.json();
      
      if (user1Data.success) {
        const adminMessageForUser1 = user1Data.data.find(m => m.id === messageId);
        
        if (adminMessageForUser1) {
          console.log('✅ User1 voit le message de l\'admin');
          console.log(`   Nom affiché: ${adminMessageForUser1.user_name}`);
          console.log(`   Contenu: ${adminMessageForUser1.content}`);
        } else {
          console.log('❌ User1 ne voit pas le message de l\'admin (ERREUR)');
        }
        
        console.log(`Messages dans header user1: ${user1Data.data.length}`);
      }
      
    } else {
      console.log('❌ Échec de l\'envoi du commentaire');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testAdminComment();
