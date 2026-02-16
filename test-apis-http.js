// Test simple des APIs avec fetch
async function testAPIs() {
  console.log('=== TEST DES APIs ===');
  
  try {
    // Test API users
    console.log('\n--- Test API /api/users ---');
    const usersResponse = await fetch('http://localhost:3000/api/users');
    const usersData = await usersResponse.json();
    console.log('Status:', usersResponse.status);
    console.log('Users API Response:', usersData);
    
    // Test API daos
    console.log('\n--- Test API /api/daos ---');
    const daosResponse = await fetch('http://localhost:3000/api/daos');
    const daosData = await daosResponse.json();
    console.log('Status:', daosResponse.status);
    console.log('DAOs API Response:', daosData);
    
  } catch (error) {
    console.error('Erreur lors du test des APIs:', error);
  }
}

testAPIs();
