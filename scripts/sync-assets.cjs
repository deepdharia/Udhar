const fs = require('node:fs');
const path = require('node:path');
const source = path.join(__dirname, '../www');
const destination = path.join(__dirname, '../android/app/src/main/assets/public');
const check = process.argv.includes('--check');
for (const name of fs.readdirSync(source)) {
  const from = path.join(source, name), to = path.join(destination, name);
  if (!fs.statSync(from).isFile()) continue;
  if (check) {
    if (!fs.existsSync(to) || !fs.readFileSync(from).equals(fs.readFileSync(to))) throw new Error('Android asset differs: ' + name);
  } else fs.copyFileSync(from, to);
}
console.log(check ? 'Web and Android assets match.' : 'Android assets synced from www/.');
