// Test pour trouver les 3 erreurs dans le fichier daos/[id]/route.ts
const fs = require('fs');

console.log('=== RECHERCHE DES 3 ERREURS ===');

const filePath = 'c:/Users/LENOVO/Desktop/dao-project/app/api/daos/[id]/route.ts';

try {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  console.log('\n--- Analyse ligne par ligne ---');
  
  // Chercher les erreurs courantes
  const errors = [];
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();
    
    // Erreur 1: Points-virgules manquants
    if (trimmedLine && !trimmedLine.endsWith(';') && !trimmedLine.endsWith('{') && !trimmedLine.endsWith('}') && 
        !trimmedLine.startsWith('//') && !trimmedLine.startsWith('/*') && !trimmedLine.startsWith('*') &&
        !trimmedLine.startsWith('export') && !trimmedLine.startsWith('import') &&
        !trimmedLine.includes('return NextResponse') && !trimmedLine.includes('await connection')) {
      
      // Vérifier si c'est vraiment une erreur
      const nextLine = lines[index + 1] || '';
      const nextLineTrimmed = nextLine.trim();
      
      // Si la ligne suivante commence par '}' ou 'return' ou 'await', c'est probablement OK
      if (!nextLineTrimmed.startsWith('}') && !nextLineTrimmed.startsWith('return') && 
          !nextLineTrimmed.startsWith('await') && !nextLineTrimmed.startsWith('}')) {
        errors.push(`Ligne ${lineNum}: Point-virgule manquant - "${trimmedLine}"`);
      }
    }
    
    // Erreur 2: Problèmes avec les accolades
    if (trimmedLine === '{' && index > 0) {
      const prevLine = lines[index - 1] || '';
      if (!prevLine.trim().endsWith(';')) {
        errors.push(`Ligne ${lineNum}: Accolade ouvrante sans point-virgule précédent`);
      }
    }
    
    // Erreur 3: Problèmes avec les parenthèses
    const openParens = (trimmedLine.match(/\(/g) || []).length;
    const closeParens = (trimmedLine.match(/\)/g) || []).length;
    if (openParens !== closeParens && trimmedLine.includes('function')) {
      errors.push(`Ligne ${lineNum}: Parenthèses non équilibrées - ${openParens} ouvertes, ${closeParens} fermées`);
    }
  });
  
  console.log(`\n🔍 Erreurs trouvées: ${errors.length}`);
  
  if (errors.length > 0) {
    errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  } else {
    console.log('✅ Aucune erreur évidente détectée');
  }
  
  // Vérifier les 3 fonctions principales
  console.log('\n--- Vérification des 3 fonctions ---');
  
  const getMatch = content.match(/export async function GET\([\s\S]*?\)\s*\{/s);
  const putMatch = content.match(/export async function PUT\([\s\S]*?\)\s*\{/s);
  const deleteMatch = content.match(/export async function DELETE\([\s\S]*?\)\s*\{/s);
  
  console.log(`GET: ${getMatch ? '✅ Trouvée' : '❌ Manquante'}`);
  if (getMatch) {
    console.log(`   Signature: ${getMatch[1]}`);
  }
  
  console.log(`PUT: ${putMatch ? '✅ Trouvée' : '❌ Manquante'}`);
  if (putMatch) {
    console.log(`   Signature: ${putMatch[1]}`);
  }
  
  console.log(`DELETE: ${deleteMatch ? '✅ Trouvée' : '❌ Manquante'}`);
  if (deleteMatch) {
    console.log(`   Signature: ${deleteMatch[1]}`);
  }
  
  // Vérifier les params dans chaque fonction
  console.log('\n--- Vérification des params ---');
  
  const getParams = content.match(/export async function GET\([\s\S]*?)\s*\{([\s\S]*?)const daoId = await params\.id/s);
  const putParams = content.match(/export async function PUT\([\s\S]*?)\s*\{([\s\S]*?)const daoId = await params\.id/s);
  const deleteParams = content.match(/export async function DELETE\([\s\S]*?)\s*\{([\s\S]*?)const daoId = await params\.id/s);
  
  console.log(`GET params: ${getParams ? '✅ await params.id' : '❌ params.id'}`);
  console.log(`PUT params: ${putParams ? '✅ await params.id' : '❌ params.id'}`);
  console.log(`DELETE params: ${deleteParams ? '✅ await params.id' : '❌ params.id'}`);
  
  // Afficher les lignes problématiques possibles
  console.log('\n--- Lignes potentiellement problématiques ---');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Lignes qui contiennent des erreurs potentielles
    if (line.includes('params.id') && !line.includes('await')) {
      console.log(`Ligne ${lineNum}: params.id sans await - ${line.trim()}`);
    }
    
    if (line.includes('await params.id') && line.includes('params: { id: string }')) {
      console.log(`Ligne ${lineNum}: await params.id avec ancienne signature - ${line.trim()}`);
    }
  });
  
  console.log('\n=== RECOMMANDATIONS ===');
  console.log('Corrections possibles:');
  console.log('1. Ajouter des points-virgules manquants');
  console.log('2. Corriger les signatures de fonctions (params Promise)');
  console.log('3. Ajouter await devant params.id partout');
  console.log('4. Vérifier les accolades et parenthèses');
  
} catch (error) {
  console.error('❌ Erreur lecture fichier:', error.message);
}
