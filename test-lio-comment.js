const mysql = require('mysql2/promise');

async function testLioComment() {
  try {
    console.log('=== TEST ENVOI COMMENTAIRE LIO ===');
    
    // Simuler l'envoi d'un commentaire par lio (ID 43)
    console.log('\n--- Envoi d\'un commentaire par lio (ID 43) ---');
    
    const createResponse = await fetch('http://localhost:3000/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task_id: 1,
        user_id: 43, // lio avec le bon ID
        content: 'Commentaire test lio depuis modal admin',
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
      
      // Vérifier que lio ne voit pas son propre message dans le header
      console.log('\n--- Vérification header lio (ID 43) ---');
      
      const lioResponse = await fetch('http://localhost:3000/api/messages?user_id=43', { 
        cache: "no-store",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const lioData = await lioResponse.json();
      
      if (lioData.success) {
        const lioMessage = lioData.data.find(m => m.id === messageId);
        
        if (lioMessage) {
          console.log('❌ Lio voit son propre message dans le header (ERREUR)');
        } else {
          console.log('✅ Lio ne voit pas son propre message dans le header (CORRECT)');
        }
        
        console.log(`Messages dans header lio: ${lioData.data.length}`);
      }
      
      // Vérifier que admin voit le message de lio
      console.log('\n--- Vérification header admin (ID 41) ---');
      
      const adminResponse = await fetch('http://localhost:3000/api/messages?user_id=41', { 
        cache: "no-store",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const adminData = await adminResponse.json();
      
      if (adminData.success) {
        const lioMessageForAdmin = adminData.data.find(m => m.id === messageId);
        
        if (lioMessageForAdmin) {
          console.log('✅ Admin voit le message de lio');
          console.log(`   Nom affiché: ${lioMessageForAdmin.user_name}`);
          console.log(`   Contenu: ${lioMessageForAdmin.content}`);
        } else {
          console.log('❌ Admin ne voit pas le message de lio (ERREUR)');
        }
        
        console.log(`Messages dans header admin: ${adminData.data.length}`);
      }
      
    } else {
      console.log('❌ Échec de l\'envoi du commentaire');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testLioComment();
