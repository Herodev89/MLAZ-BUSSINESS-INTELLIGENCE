const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'lib/actions');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Only add await if it's not already there
  content = content.replace(/(?<!await\s)db\.prepare/g, 'await db.prepare');
  
  fs.writeFileSync(filePath, content, 'utf8');
});

// Also do seed-sqlite.ts
const seedPath = path.join(__dirname, 'seed-sqlite.ts');
if (fs.existsSync(seedPath)) {
  let content = fs.readFileSync(seedPath, 'utf8');
  content = content.replace(/(?<!await\s)db\.prepare/g, 'await db.prepare');
  // Also we need to make sure insertProduct.run() is awaited.
  // In seed-sqlite.ts, we assigned db.prepare to variables.
  // e.g. const insertProduct = db.prepare(...)
  // We need to add await to insertProduct.run, insertVariant.run, insertSale.run, insertMov.run
  content = content.replace(/(insert[A-Za-z]+)\.run/g, 'await $1.run');
  fs.writeFileSync(seedPath, content, 'utf8');
}

// Check api/seed/route.ts
const apiPath = path.join(__dirname, 'app/api/seed/route.ts');
if (fs.existsSync(apiPath)) {
  let content = fs.readFileSync(apiPath, 'utf8');
  content = content.replace(/(?<!await\s)db\.prepare/g, 'await db.prepare');
  content = content.replace(/db\.exec\(/g, 'await db.executeMultiple(');
  fs.writeFileSync(apiPath, content, 'utf8');
}

console.log("Refactoring complete.");
