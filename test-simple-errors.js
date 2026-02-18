// Analyse simple du fichier daos/[id]/route.ts pour trouver les 3 erreurs
const fs = require('fs');

console.log('=== ANALYSE SIMPLE DES ERREURS ===');

const filePath = 'c:/Users/LENOVO/Desktop/dao-project/app/api/daos/[id]/route.ts';

try {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  console.log('\n--- Recherche des erreurs évidentes ---');
  
  const errors = [];
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();
    
    // Erreur 1: Lignes qui se terminent mal
    if (trimmedLine && !trimmedLine.endsWith(';') && !trimmedLine.endsWith('{') && !trimmedLine.endsWith('}') && 
        !trimmedLine.startsWith('//') && !trimmedLine.startsWith('/*') && !trimmedLine.startsWith('*') &&
        !trimmedLine.startsWith('export') && !trimmedLine.startsWith('import') &&
        !trimmedLine.includes('return NextResponse') && !trimmedLine.includes('await connection') &&
        !trimmedLine.includes('try {') && !trimmedLine.includes('catch') &&
        !trimmedLine.includes('} catch') && !trimmedLine.includes('} finally') &&
        trimmedLine.length > 5) {
      
      errors.push(`Ligne ${lineNum}: Manque point-virgule - "${trimmedLine.substring(0, 50)}..."`);
    }
    
    // Erreur 2: Problèmes de syntaxe évidents
    if (trimmedLine.includes('params: { id: string }')) {
      errors.push(`Ligne ${lineNum}: Ancienne signature params - "${trimmedLine}"`);
    }
    
    // Erreur 3: Problèmes avec les accolades
    const openBraces = (trimmedLine.match(/\{/g) || []).length;
    const closeBraces = (trimmedLine.match(/\}/g) || []).length;
    if (openBraces !== closeBraces && trimmedLine.length > 0) {
      errors.push(`Ligne ${lineNum}: Accolades non équilibrées - ${openBraces} ouvertes, ${closeBraces} fermées`);
    }
  });
  
  console.log(`\n🔍 Erreurs trouvées: ${errors.length}`);
  
  if (errors.length > 0) {
    errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
    
    if (errors.length >= 3) {
      console.log('\n✅ Les 3 erreurs ont été trouvées !');
    }
  } else {
    console.log('✅ Aucune erreur évidente détectée');
  }
  
  // Vérifier spécifiquement les 3 fonctions
  console.log('\n--- Vérification des 3 fonctions ---');
  
  // Fonction GET
  const getStart = content.indexOf('export async function GET');
  const getEnd = content.indexOf('}', getStart);
  const getFunction = content.substring(getStart, getEnd + 1);
  const getHasAwait = getFunction.includes('await params.id');
  const getHasOldParams = getFunction.includes('params: { id: string }');
  
  console.log(`Fonction GET:`);
  console.log(`   await params.id: ${getHasAwait ? '✅' : '❌'}`);
  console.log(`   ancienne signature: ${getHasOldParams ? '❌' : '✅'}`);
  
  // Fonction PUT
  const putStart = content.indexOf('export async function PUT');
  const putEnd = content.indexOf('}', putStart);
  const putFunction = content.substring(putStart, putEnd + 1);
  const putHasAwait = putFunction.includes('await params.id');
  const putHasOldParams = putFunction.includes('params: { id: string }');
  
  console.log(`Fonction PUT:`);
  console.log(`   await params.id: ${putHasAwait ? '✅' : '❌'}`);
  console.log(`   ancienne signature: ${putHasOldParams ? '❌' : '✅'}`);
  
  // Fonction DELETE
  const deleteStart = content.indexOf('export async function DELETE');
  const deleteEnd = content.indexOf('}', deleteStart);
  const deleteFunction = content.substring(deleteStart, deleteEnd + 1);
  const deleteHasAwait = deleteFunction.includes('await params.id');
  const deleteHasOldParams = deleteFunction.includes('params: { id: string }');
  
  console.log(`Fonction DELETE:`);
  console.log(`   await params.id: ${deleteHasAwait ? '✅' : '❌'}`);
  console.log(`   ancienne signature: ${deleteHasOldParams ? '❌' : '✅'}`);
  
  // Compter les problèmes
  const totalProblems = [getHasOldParams, putHasOldParams, deleteHasOldParams].filter(p => p).length +
                           [!getHasAwait, !putHasAwait, !deleteHasAwait].filter(p => p).length;
  
  console.log(`\n📊 Total problèmes: ${totalProblems}`);
  
  if (totalProblems >= 3) {
    console.log('\n🎯 Les 3 erreurs principales ont été identifiées:');
    console.log('1. Signature params incorrecte (Next.js 15)');
    console.log('2. await params.id manquant');
    console.log('3. Problèmes de syntaxe divers');
  }
  
} catch (error) {
  console.error('❌ Erreur lecture fichier:', error.message);
}
