// Simuler le localStorage pour le test
const mockLocalStorage = {
  user: JSON.stringify({
    id: 43,
    username: 'lio',
    email: 'lio@example.com',
    role_id: 3
  })
};

console.log('=== TEST LOCAL STORAGE USER ===');
console.log('Utilisateur dans localStorage:', JSON.parse(mockLocalStorage.user));
console.log('ID:', JSON.parse(mockLocalStorage.user).id);
console.log('Username:', JSON.parse(mockLocalStorage.user).username);
console.log('Nom qui devrait être utilisé:', JSON.parse(mockLocalStorage.user).username || JSON.parse(mockLocalStorage.user).email?.split('@')[0]);
