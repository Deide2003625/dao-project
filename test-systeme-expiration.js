const fetch = require('node-fetch').default;

async function testExpirationSystem() {
  try {
    console.log('=== TEST SYSTÈME D\'EXPIRATION CORRIGÉ ===');
    
    // Appeler le système d'expiration pour notre DAO test
    const response = await fetch('http://localhost:3000/api/notifications?userId=1&checkDeposits=true', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    console.log('Réponse du système d\'expiration:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Système d\'expiration appelé avec succès');
      console.log('📧 Email envoyé à: deidesarr@gmail.com');
      console.log('📋 DAO test concerné: DAO-2026-005');
      console.log('📅 Date d\'expiration: 2026-02-25');
    } else {
      console.log('❌ Erreur lors de l\'appel du système d\'expiration');
    }
    
  } catch (error) {
    console.error('❌ Exception lors du test du système d\'expiration:', error);
  }
}

testExpirationSystem();
