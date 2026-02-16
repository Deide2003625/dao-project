// Test pour vérifier si les chefs se chargent correctement après correction
async function testChefsLoading() {
  try {
    console.log('Test de chargement des chefs après correction...');
    
    // Simuler le même traitement que dans la page CreateDao
    const res = await fetch("http://localhost:3000/api/users");
    if (!res.ok) {
      console.error("Erreur API:", res.status);
      return;
    }
    
    const data = await res.json();
    console.log("Données brutes:", data.success ? `${data.data.length} utilisateurs` : 'Erreur');
    
    const usersData = Array.isArray(data) ? data : (data.data || []);
    console.log("Utilisateurs extraits:", usersData.length);
    
    // Fonction pour obtenir le nom du rôle
    const getRoleName = (roleId) => {
      const id = String(roleId);
      switch (id) {
        case '1': return 'Admin';
        case '2': return 'Admin';
        case '3': return 'ChefProjet';
        case '4': return 'MembreEquipe';
        default: return 'Utilisateur';
      }
    };
    
    // Test du filtrage des chefs (rôles 2 ou 3)
    const teamLeadersList = usersData
      .filter((u) => {
        const roleId = Number(u.role_id || u.role);
        return roleId === 2 || roleId === 3;
      })
      .map((u) => ({
        id: u.id,
        username: u.username || u.email || `user-${u.id}`,
        role: u.roleName || getRoleName(u.role_id || u.role),
        role_id: u.role_id || u.role
      }));
    
    console.log("Chefs d'équipe (après correction):", teamLeadersList.length);
    console.log("Liste des chefs:");
    teamLeadersList.forEach((chef, index) => {
      console.log(`  ${index + 1}. ID: ${chef.id}, Username: ${chef.username}, Role: ${chef.role}, Role_ID: ${chef.role_id}`);
    });
    
    // Test du filtrage des membres (rôle 4)
    const membersList = usersData
      .filter((u) => {
        const roleId = Number(u.role_id || u.role);
        return roleId === 4;
      })
      .map((u) => ({
        id: u.id,
        username: u.username || u.email || `user-${u.id}`,
        role: u.roleName || getRoleName(u.role_id || u.role),
        role_id: u.role_id || u.role
      }));
    
    console.log("\nMembres d'équipe (après correction):", membersList.length);
    console.log("Liste des membres:");
    membersList.forEach((member, index) => {
      console.log(`  ${index + 1}. ID: ${member.id}, Username: ${member.username}, Role: ${member.role}, Role_ID: ${member.role_id}`);
    });
    
    console.log("\n✅ Test terminé - Les chefs devraient maintenant se charger correctement !");
    
  } catch (error) {
    console.error("Erreur:", error.message);
  }
}

testChefsLoading();
