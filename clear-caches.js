// Script pour vider tous les caches et redémarrer l'application
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== VIDAGE COMPLET DES CACHES ===');

console.log('\n--- Étape 1: Vider les caches Next.js ---');

try {
  // Vider le cache Next.js
  const nextCachePath = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextCachePath)) {
    console.log('🗑️  Suppression du dossier .next...');
    execSync('rm -rf .next', { stdio: 'inherit' });
    console.log('✅ Cache Next.js vidé');
  } else {
    console.log('ℹ️  Dossier .next non trouvé');
  }
} catch (error) {
  console.log('❌ Erreur vidage cache Next.js:', error.message);
}

console.log('\n--- Étape 2: Vider les caches npm ---');

try {
  // Vider les caches npm
  console.log('🗑️  Vidage des caches npm...');
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ Cache npm vidé');
} catch (error) {
  console.log('❌ Erreur vidage cache npm:', error.message);
}

console.log('\n--- Étape 3: Réinstaller les dépendances ---');

try {
  // Réinstaller les dépendances
  console.log('📦 Réinstallation des dépendances...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dépendances réinstallées');
} catch (error) {
  console.log('❌ Erreur réinstallation dépendances:', error.message);
}

console.log('\n--- Étape 4: Instructions pour le navigateur ---');

console.log('🌐 Pour vider le cache du navigateur:');
console.log('1. Ouvrir les outils de développement (F12)');
console.log('2. Aller dans l\'onglet "Application"');
console.log('3. Dans "Storage", cliquer sur "Clear site data"');
console.log('4. Ou utiliser Ctrl+Shift+Delete pour vider tout');
console.log('5. Fermer et rouvrir le navigateur');

console.log('\n--- Étape 5: Redémarrage du serveur ---');

console.log('🚀 Pour redémarrer le serveur:');
console.log('1. Arrêter le serveur actuel (Ctrl+C)');
console.log('2. Lancer: npm run dev');
console.log('3. Attendre le démarrage complet (10-15 secondes)');
console.log('4. Ouvrir: http://localhost:3000/dash/admin/allDao');

console.log('\n--- Étape 6: Test de validation ---');

console.log('🧪 Après redémarrage, tester:');
console.log('1. API: curl http://localhost:3000/api/dao');
console.log('2. Page: http://localhost:3000/dash/admin/allDao');
console.log('3. Vérifier que les chefs s\'affichent');

console.log('\n=== RÉSUMÉ ===');
console.log('✅ Caches Next.js vidés');
console.log('✅ Caches npm vidés');
console.log('✅ Dépendances réinstallées');
console.log('🌐 Vider manuellement le cache navigateur');
console.log('🚀 Redémarrer le serveur');
console.log('🧪 Tester l\'affichage des chefs');

console.log('\n🎯 Résultat attendu:');
console.log('- Tous les DAOs devraient afficher leur chef_projet');
console.log("- lio, manager1, test_chef_de_projet_... devraient être visibles");
console.log('- La colonne "Chef projet" devrait être remplie');

console.log('\n🔧 Si le problème persiste:');
console.log('1. Tester en mode navigation privée');
console.log('2. Essayer un autre navigateur');
console.log('3. Vérifier les logs du serveur');
console.log('4. Vérifier la console du navigateur (F12)');
