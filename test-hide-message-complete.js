const mysql = require('mysql2/promise');

async function testHideMessageWithNewMessage() {
  try {
    console.log('=== TEST API HIDE MESSAGE (AVEC CRÉATION) ===');
    
    // D'abord, créer un message public depuis user1 (45) pour que tout le monde puisse le voir
    console.log('\n--- Création d\'un message public depuis user1 ---');
    
    const createResponse = await fetch('http://localhost:3000/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task_id: 1,
        user_id: 45, // user1
        content: 'Message de test pour masquage',
        mentioned_user_id: null,
        mentioned_user_name: null,
        is_public: true
      }),
    });
    
    const createResult = await createResponse.json();
    console.log('Création message:', createResult);
    
    if (createResult.success) {
      const messageId = createResult.data.id;
      
      // Vérifier que le message est visible pour l'utilisateur 43 (lio)
      console.log('\n--- Vérification que le message est visible pour l\'utilisateur 43 ---');
      
      const getResponse = await fetch('http://localhost:3000/api/messages?user_id=43', { 
        cache: "no-store",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const getData = await getResponse.json();
      
      if (getData.success && getData.data && getData.data.find(m => m.id === messageId)) {
        console.log('✅ Message visible pour l\'utilisateur 43');
        
        // Masquer le message pour l'utilisateur 43
        console.log('\n--- Masquage du message pour l\'utilisateur 43 ---');
        
        const hideResponse = await fetch('http://localhost:3000/api/messages/hide', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: 43,
            message_id: messageId
          }),
        });
        
        const hideResult = await hideResponse.json();
        console.log('Masquage:', hideResult);
        
        // Vérifier que le message est masqué pour l'utilisateur 43
        console.log('\n--- Vérification du masquage pour l\'utilisateur 43 ---');
        
        const verifyResponse = await fetch('http://localhost:3000/api/messages?user_id=43', { 
          cache: "no-store",
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const verifyData = await verifyResponse.json();
        console.log(`Messages restants pour l'utilisateur 43: ${verifyData.data?.length || 0}`);
        
        if (verifyData.data && !verifyData.data.find(m => m.id === messageId)) {
          console.log('✅ Message masqué avec succès pour l\'utilisateur 43 !');
        } else {
          console.log('❌ Le message n\'a pas été masqué correctement pour l\'utilisateur 43');
        }
        
        // Vérifier que le message est toujours visible pour l'utilisateur 41 (admin)
        console.log('\n--- Vérification que le message est toujours visible pour l\'utilisateur 41 ---');
        
        const adminResponse = await fetch('http://localhost:3000/api/messages?user_id=41', { 
          cache: "no-store",
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const adminData = await adminResponse.json();
        console.log(`Messages pour l\'utilisateur 41: ${adminData.data?.length || 0}`);
        
        if (adminData.data && adminData.data.find(m => m.id === messageId)) {
          console.log('✅ Le message est toujours visible pour l\'utilisateur 41 !');
        } else {
          console.log('❌ Le message a été supprimé pour l\'utilisateur 41 (ERREUR)');
        }
        
      } else {
        console.log('❌ Le message n\'est pas visible pour l\'utilisateur 43');
      }
      
    } else {
      console.log('❌ Échec de la création du message');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testHideMessageWithNewMessage();
