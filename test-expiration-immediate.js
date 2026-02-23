const fetch = require('node-fetch').default;

async function testExpirationNow() {
  try {
    console.log('=== TEST D\'EXPIRATION IMMÉDIAT ===');
    console.log('Simulation: Aujourd\'hui = 2026-02-25 (date d\'expiration)');
    
    // Créer un DAO qui expire aujourd'hui pour tester
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const daoData = {
      date_depot: todayStr, // Aujourd'hui = expiration immédiate
      objet: 'DAO TEST EXPIRATION AUJOURD\'HUI',
      description: 'DAO créé pour tester l\'email d\'expiration immédiate',
      reference: 'TEST-EXPIRATION-AUJOURDHUI',
      autorite: 'Autorité Test',
      chefEquipe: '78',
      membres: ['68', '49'],
      groupement: 'non',
      nomPartenaire: null
    };
    
    console.log('Création DAO avec date d\'aujourd\'hui:', todayStr);
    
    const createResponse = await fetch('http://localhost:3000/api/dao', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(daoData)
    });
    
    const createResult = await createResponse.json();
    console.log('DAO créé:', createResult.success ? '✅' : '❌');
    
    if (createResult.success) {
      // Test immédiatement le système d'expiration
      console.log('Test du système d\'expiration...');
      
      const expResponse = await fetch('http://localhost:3000/api/notifications?userId=1&checkDeposits=true', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const expResult = await expResponse.json();
      console.log('Réponse expiration:', JSON.stringify(expResult, null, 2));
      
      if (expResult.success && expResult.notifications && expResult.notifications.length > 0) {
        console.log('✅ Email d\'expiration envoyé immédiatement !');
        console.log('📧 Destinataire: deidesarr@gmail.com');
        console.log('📋 DAO concerné:', daoData.objet);
      } else {
        console.log('❌ Email d\'expiration pas encore envoyé');
      }
    }
    
  } catch (error) {
    console.error('❌ Exception lors du test d\'expiration immédiate:', error);
  }
}

testExpirationNow();
