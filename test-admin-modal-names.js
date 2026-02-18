const mysql = require('mysql2/promise');

async function testAdminModalNames() {
  try {
    console.log('=== TEST NOMS DANS MODAL ADMIN ===');
    
    // Récupérer les commentaires pour la tâche 1 (ceux que l'admin voit)
    console.log('\n--- Commentaires pour la tâche 1 (vue admin) ---');
    
    const response = await fetch('http://localhost:3000/api/messages?task_id=1', { 
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const json = await response.json();
    
    if (json.success && json.data) {
      console.log(`✅ ${json.data.length} messages trouvés pour la tâche 1`);
      
      // Filtrer comme le ferait l'admin (exclure ses propres messages)
      const adminId = 41;
      const filteredMessages = json.data.filter(comment => {
        if (comment.user_id === adminId) return false;
        if (comment.is_public) return true;
        return comment.mentioned_user_id === adminId;
      });
      
      console.log(`\n📋 Messages que l'admin voit dans le modal: ${filteredMessages.length} messages`);
      
      filteredMessages.forEach((msg, index) => {
        console.log(`  ${index + 1}. ID=${msg.id}`);
        console.log(`     Contenu: ${msg.content}`);
        console.log(`     user_name de l'API: ${msg.user_name}`);
        console.log(`     user adapté: ${msg.user_name || 'Utilisateur'}`);
        console.log(`     user_id: ${msg.user_id}`);
        console.log('');
      });
      
      // Vérifier spécifiquement le dernier message de l'admin
      const adminMessages = json.data.filter(comment => comment.user_id === adminId);
      
      console.log('\n📋 Messages de l\'admin (qui ne devraient pas apparaître dans le modal):');
      adminMessages.forEach((msg, index) => {
        console.log(`  ${index + 1}. ID=${msg.id}`);
        console.log(`     Contenu: ${msg.content}`);
        console.log(`     user_name de l'API: ${msg.user_name}`);
        console.log(`     user_id: ${msg.user_id}`);
        console.log('');
      });
      
    } else {
      console.log('❌ Erreur API messages');
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

testAdminModalNames();
