const fs = require('fs');
const path = require('path');

const storeDir = path.join(__dirname, 'src', 'store');
const files = fs.readdirSync(storeDir).filter(f => f.endsWith('.ts') && f !== 'authStore.ts');

files.forEach(file => {
  const filePath = path.join(storeDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace get
  content = content.replace(/const res = await fetch\(`\$\{API_URL\}([^`]+)`\)/g, 'const { data } = await api.get(`$1`)');
  content = content.replace(/const data = await res\.json\(\)/g, '');
  content = content.replace(/const \w+ = await \w+Res\.json\(\)/g, ''); // For Promise.all in regionStore

  // We have to be careful with the exact replacements. It might be easier to just do simple replacements.
  // Actually, wait, replacing fetch completely with api is tricky with regex because of the options object.
  // e.g. fetch(`${API_URL}/candidates`, { method: 'POST', body: JSON.stringify(data) })
  
  // It's safer to just do a simple replacement of API_URL since I already deleted it from the top!
  // Oh wait, if I deleted API_URL but didn't replace the usages, the code will throw a ReferenceError for API_URL!
  // Let me just replace `${API_URL}` with `http://localhost:3000` temporarily, OR better:
  // Let's replace fetch(`${API_URL}/...`) with api(....). 
  // No, `api` is axios. Axios has different signature.
});
