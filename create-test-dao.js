const fetch = require('node-fetch').default;

async function createTestDao() {
  console.log('=== CRÉATION DAO TEST - DÉBUT ===');
  
  const payload = {
    date_depot: "2024-12-31",
    objet: "DAO TEST - Vérification Email",
    description: "Ceci est un DAO test pour vérifier l'envoi d'email de notification automatique",
    reference: "TEST-EMAIL-001",
    autorite: "Autorité Test",
    chefEquipe: 1,
    membres: [1],
    groupement: "non",
    nomPartenaire: ""
  };

  console.log('Payload envoyé:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch('http://localhost:3000/api/dao', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Réponse:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ DAO test créé avec succès !');
      console.log('📧 Email de notification devrait être envoyé à deidesarr@gmail.com');
      console.log('🔍 Vérifiez votre email et les logs du terminal');
    } else {
      console.log('❌ Erreur lors de la création du DAO:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la requête:', error);
  }
  
  console.log('=== CRÉATION DAO TEST - TERMINÉ ===');
}

createTestDao();
