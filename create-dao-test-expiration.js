const fetch = require('node-fetch').default;

async function createTestDao() {
  try {
    console.log('=== CRÉATION AUTOMATIQUE DAO TEST EXPIRATION ===');
    
    // Date d'expiration dans 3 jours
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 3);
    const dateDepot = expirationDate.toISOString().split('T')[0];
    
    console.log('Date de dépôt:', dateDepot);
    
    // Données du DAO test
    const daoData = {
      date_depot: dateDepot,
      objet: 'DAO TEST EXPIRATION 3 JOURS',
      description: 'DAO créé pour tester l\'email d\'expiration automatique',
      reference: 'TEST-EXPIRATION-20260225',
      autorite: 'Autorité Test',
      chefEquipe: '78', // Utiliser un chef de projet valide
      membres: ['68', '49'], // Utiliser des membres avec le rôle MembreEquipe
      groupement: 'non',
      nomPartenaire: null
    };
    
    console.log('Données du DAO:', JSON.stringify(daoData, null, 2));
    
    // Créer le DAO
    const response = await fetch('http://localhost:3000/api/dao', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(daoData)
    });
    
    const result = await response.json();
    console.log('Réponse de l\'API:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ DAO TEST créé avec succès !');
      console.log('📋 Numéro:', result.numero);
      console.log('📅 Date de dépôt:', dateDepot);
      console.log('⏰ Email d\'expiration attendu dans 3 jours');
      console.log('📧 Destinataire: deidesarr@gmail.com');
    } else {
      console.log('❌ Erreur lors de la création du DAO:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Exception lors de la création du DAO:', error);
  }
}

createTestDao();
