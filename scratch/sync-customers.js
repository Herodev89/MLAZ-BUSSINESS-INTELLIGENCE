const { createClient } = require('@libsql/client');
const path = require('path');
const fs = require('fs');

const url = process.env.TURSO_DATABASE_URL || `file:${path.join(process.cwd(), 'prisma/dev.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

async function sync() {
  console.log("Syncing customers total spent...");
  
  // 1. Ensure totalSpent is not null
  await client.execute('UPDATE Customer SET totalSpent = 0 WHERE totalSpent IS NULL');
  
  // 2. Fetch all customers
  const res = await client.execute('SELECT * FROM Customer');
  const customers = res.rows;
  
  for (const c of customers) {
    const name = c.name;
    const salesRes = await client.execute({
      sql: 'SELECT SUM(amount) as total FROM Sale WHERE customerName = ?',
      args: [name]
    });
    
    let sum = salesRes.rows[0].total || 0;
    
    await client.execute({
      sql: 'UPDATE Customer SET totalSpent = ? WHERE id = ?',
      args: [sum, c.id]
    });
    console.log(`Updated ${name} to ${sum}`);
  }
  
  console.log("Done");
}

sync().catch(console.error);
