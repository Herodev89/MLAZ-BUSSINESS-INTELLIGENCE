const { createClient } = require('@libsql/client');
const path = require('path');

const url = process.env.TURSO_DATABASE_URL || `file:${path.join(process.cwd(), 'prisma/dev.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

async function migrate() {
  console.log("Adding discount columns...");
  
  try {
    await client.execute('ALTER TABLE "Order" ADD COLUMN discount REAL DEFAULT 0');
    console.log("Added discount to Order");
  } catch (e) {
    console.log("Order alter failed (might already exist):", e.message);
  }
  
  try {
    await client.execute('ALTER TABLE Sale ADD COLUMN discount REAL DEFAULT 0');
    console.log("Added discount to Sale");
  } catch (e) {
    console.log("Sale alter failed (might already exist):", e.message);
  }
  
  console.log("Done");
}

migrate().catch(console.error);
