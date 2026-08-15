import db from './lib/db';
db.prepare("DELETE FROM Sale WHERE id LIKE 'TX-HIST-%' OR customerName IN ('Jane Smith', 'Walk-in Customer')").run();
console.log('Mock sales deleted.');
