const mysql = require('mysql2/promise');

async function testDeleteMessage() {
  try {
    console.log('=== TEST API DELETE MESSAGE ===');
    
    // D'abord, récupérer un message existant
    console.log('\n--- Récupération d\'un message existant ---');
    
    const getResponse = await fetch('http://localhost:3000/api/messages?user_id=43', { 
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const getData = await getResponse.json();
    
    if (getData.success && getData.data && getData.data.length > 0) {
      const messageToDelete = getData.data[0];
      console.log(`Message à supprimer: ID=${messageToDelete.id}, Contenu: "${messageToDelete.content}"`);
      
      // Supprimer le message
      console.log('\n--- Suppression du message ---');
      
      const deleteResponse = await fetch(`http://localhost:3000/api/messages/${messageToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const deleteResult = await deleteResponse.json();
      console.log('Status:', deleteResponse.status);
      console.log('Résultat:', deleteResult);
      
      // Vérifier que le message a bien été supprimé
      console.log('\n--- Vérification de la suppression ---');
      
      const verifyResponse = await fetch('http://localhost:3000/api/messages?user_id=43', { 
        cache: "no-store",
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const verifyData = await verifyResponse.json();
      console.log(`Messages restants: ${verifyData.data?.length || 0}`);
      
      if (verifyData.data && !verifyData.data.find(m => m.id === messageToDelete.id)) {
        console.log('✅ Message supprimé avec succès !');
      } else {
        console.log('❌ Le message n\'a pas été supprimé correctement');
      }
      
    } else {
      console.log('❌ Aucun message trouvé pour le test');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testDeleteMessage();
