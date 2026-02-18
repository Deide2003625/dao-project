const mysql = require('mysql2/promise');

async function testHideMessage() {
  try {
    console.log('=== TEST API HIDE MESSAGE ===');
    
    // D'abord, récupérer un message existant pour l'utilisateur 43
    console.log('\n--- Récupération d\'un message existant pour l\'utilisateur 43 ---');
    
    const getResponse = await fetch('http://localhost:3000/api/messages?user_id=43', { 
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const getData = await getResponse.json();
    
    if (getData.success && getData.data && getData.data.length > 0) {
      const messageToHide = getData.data[0];
      console.log(`Message à masquer: ID=${messageToHide.id}, Contenu: "${messageToHide.content}"`);
      
      // Masquer le message pour l'utilisateur 43
      console.log('\n--- Masquage du message pour l\'utilisateur 43 ---');
      
      const hideResponse = await fetch('http://localhost:3000/api/messages/hide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 43,
          message_id: messageToHide.id
        }),
      });
      
      const hideResult = await hideResponse.json();
      console.log('Status:', hideResponse.status);
      console.log('Résultat:', hideResult);
      
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
      
      if (verifyData.data && !verifyData.data.find(m => m.id === messageToHide.id)) {
        console.log('✅ Message masqué avec succès pour l\'utilisateur 43 !');
      } else {
        console.log('❌ Le message n\'a pas été masqué correctement pour l\'utilisateur 43');
      }
      
      // Vérifier que le message est toujours visible pour un autre utilisateur (41)
      console.log('\n--- Vérification que le message est toujours visible pour l\'utilisateur 41 ---');
      
      const otherUserResponse = await fetch('http://localhost:3000/api/messages?user_id=41', { 
        cache: "no-store",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const otherUserData = await otherUserResponse.json();
      console.log(`Messages pour l\'utilisateur 41: ${otherUserData.data?.length || 0}`);
      
      if (otherUserData.data && otherUserData.data.find(m => m.id === messageToHide.id)) {
        console.log('✅ Le message est toujours visible pour l\'utilisateur 41 !');
      } else {
        console.log('❌ Le message a été supprimé pour l\'utilisateur 41 (ERREUR)');
      }
      
    } else {
      console.log('❌ Aucun message trouvé pour le test');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testHideMessage();
