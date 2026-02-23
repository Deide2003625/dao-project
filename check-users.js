const fetch = require('node-fetch').default;

async function checkUsers() {
  try {
    console.log('=== VÉRIFICATION DES UTILISATEURS ===');
    
    // Récupérer la liste des utilisateurs
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    console.log('Utilisateurs disponibles:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success && result.data) {
      console.log('\n✅ Utilisateurs avec leurs rôles:');
      result.data.forEach(user => {
        console.log(`ID: ${user.id}, Username: ${user.username}, Role: ${user.roleName || user.roleLabel}, Email: ${user.email}`);
      });
      
      console.log('\n🎯 Utilisateurs avec le rôle MembreEquipe:');
      const membreEquipeUsers = result.data.filter(user => user.roleName === 'membre_equipe');
      membreEquipeUsers.forEach(user => {
        console.log(`ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
      });
      
      if (membreEquipeUsers.length > 0) {
        console.log('\n✅ Premier utilisateur MembreEquipe trouvé:');
        const firstUser = membreEquipeUsers[0];
        console.log(`Utilisez ID: ${firstUser.id} pour le DAO test`);
        console.log(`Email: ${firstUser.email}`);
      } else {
        console.log('\n❌ Aucun utilisateur avec le rôle MembreEquipe trouvé');
        console.log('Utilisateurs disponibles avec d\'autres rôles:');
        result.data.forEach(user => {
          if (user.roleName !== 'membre_equipe') {
            console.log(`ID: ${user.id}, Username: ${user.username}, Role: ${user.roleName || user.roleLabel}, Email: ${user.email}`);
          }
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des utilisateurs:', error);
  }
}

checkUsers();
