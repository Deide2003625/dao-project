// Test simple de l'API users
async function testUsersApiSimple() {
  try {
    console.log('Test API Users...');
    const response = await fetch('http://localhost:3000/api/users');
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Données reçues:', JSON.stringify(data, null, 2));
      
      if (data.data && data.data.length > 0) {
        const chefs = data.data.filter(u => {
          const roleId = String(u.role_id);
          return roleId === '2' || roleId === '3';
        });
        console.log('Chefs trouvés:', chefs.length);
        chefs.forEach((chef, index) => {
          console.log(`${index + 1}. ID: ${chef.id}, Username: ${chef.username}, Role: ${chef.roleName}`);
        });
      }
    } else {
      console.log('Erreur:', response.statusText);
    }
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

testUsersApiSimple();
