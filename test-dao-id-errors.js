// Test pour vérifier les erreurs dans le fichier API daos/[id]
const fs = require('fs');
const path = require('path');

console.log('=== VÉRIFICATION ERREURS API DAOS/[ID] ===');

const filePath = 'c:/Users/LENOVO/Desktop/dao-project/app/api/daos/[id]/route.ts';

try {
  console.log('\n--- Étape 1: Lecture du fichier ---');
  
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`✅ Fichier lu (${content.length} caractères)`);
  
  console.log('\n--- Étape 2: Vérification de la syntaxe ---');
  
  // Vérifier les imports
  const hasNextImports = content.includes('NextRequest') && content.includes('NextResponse');
  console.log(`Imports Next.js: ${hasNextImports ? '✅' : '❌'}`);
  
  // Vérifier les exports
  const hasGetExport = content.includes('export async function GET');
  const hasPutExport = content.includes('export async function PUT');
  const hasDeleteExport = content.includes('export async function DELETE');
  console.log(`Export GET: ${hasGetExport ? '✅' : '❌'}`);
  console.log(`Export PUT: ${hasPutExport ? '✅' : '❌'}`);
  console.log(`Export DELETE: ${hasDeleteExport ? '✅' : '❌'}`);
  
  // Vérifier les params Promise
  const hasPromiseParams = content.includes('params: Promise<{ id: string }>');
  console.log(`Params Promise: ${hasPromiseParams ? '✅' : '❌'}`);
  
  // Vérifier les await params.id
  const hasAwaitParams = content.includes('await params.id');
  console.log(`Await params.id: ${hasAwaitParams ? '✅' : '❌'}`);
  
  // Vérifier le LEFT JOIN
  const hasLeftJoin = content.includes('LEFT JOIN users u ON d.chef_id = u.id');
  console.log(`LEFT JOIN: ${hasLeftJoin ? '✅' : '❌'}`);
  
  // Vérifier l'alias chef_projet
  const hasChefProjet = content.includes('u.username as chef_projet');
  console.log(`Alias chef_projet: ${hasChefProjet ? '✅' : '❌'}`);
  
  console.log('\n--- Étape 3: Vérification des erreurs courantes ---');
  
  // Vérifier les parenthèses et accolades
  const openBraces = (content.match(/\{/g) || []).length;
  const closeBraces = (content.match(/\}/g) || []).length;
  const openParens = (content.match(/\(/g) || []).length;
  const closeParens = (content.match(/\)/g) || []).length;
  
  console.log(`Accolades: ${openBraces} ouvertes, ${closeBraces} fermées ${openBraces === closeBraces ? '✅' : '❌'}`);
  console.log(`Parenthèses: ${openParens} ouvertes, ${closeParens} fermées ${openParens === closeParens ? '✅' : '❌'}`);
  
  // Vérifier les points-virgules manquants
  const missingSemicolons = content.match(/[^;]\s*\n\s*(export|function|const|let|var|return|try|catch)/g);
  console.log(`Points-virgules manquants: ${missingSemicolons ? missingSemicolons.length : 0} ${missingSemicolons ? '❌' : '✅'}`);
  
  console.log('\n--- Étape 4: Affichage du contenu ---');
  
  // Afficher les lignes importantes
  const lines = content.split('\n');
  console.log('\n📄 Lignes 1-20:');
  lines.slice(0, 20).forEach((line, index) => {
    console.log(`${String(index + 1).padStart(2, ' ')}: ${line}`);
  });
  
  console.log('\n📄 Lignes 65-85:');
  lines.slice(64, 85).forEach((line, index) => {
    console.log(`${String(65 + index).padStart(2, ' ')}: ${line}`);
  });
  
  console.log('\n--- Étape 5: Diagnostic ---');
  
  const errors = [];
  
  if (!hasNextImports) errors.push('Imports Next.js manquants');
  if (!hasGetExport) errors.push('Export GET manquant');
  if (!hasPromiseParams) errors.push('Params Promise incorrects');
  if (!hasAwaitParams) errors.push('Await params.id manquant');
  if (!hasLeftJoin) errors.push('LEFT JOIN manquant');
  if (!hasChefProjet) errors.push('Alias chef_projet manquant');
  if (openBraces !== closeBraces) errors.push('Accolades non équilibrées');
  if (openParens !== closeParens) errors.push('Parenthèses non équilibrées');
  
  if (errors.length > 0) {
    console.log('\n❌ Erreurs détectées:');
    errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  } else {
    console.log('\n✅ Aucune erreur de syntaxe détectée');
  }
  
  console.log('\n=== RECOMMANDATIONS ===');
  console.log('Si le fichier contient des erreurs:');
  console.log('1. Vérifier la console TypeScript/ESLint');
  console.log('2. Redémarrer le serveur de développement');
  console.log('3. Vérifier les logs du serveur');
  console.log('4. Tester l\'API avec curl ou Postman');
  
} catch (error) {
  console.error('❌ Erreur lecture fichier:', error.message);
}
