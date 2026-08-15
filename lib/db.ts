import { createClient } from "@libsql/client";
import path from "path";

// Initialize the libSQL client
// For local development, it will connect to the local file.
// In production on Vercel, it will use the TURSO_DATABASE_URL environment variable.
const url = process.env.TURSO_DATABASE_URL || `file:${path.join(process.cwd(), 'prisma/dev.db')}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
  url,
  authToken,
});

// Wrapper to make transition from better-sqlite3 easier
const db = {
  prepare: (sql: string) => {
    return {
      all: async (...args: any[]) => {
        // If args[0] is an array, it means it was called like run([a, b]) or it's named params
        const params = (args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0])) ? args[0] : args;
        const res = await client.execute({ sql, args: params });
        return res.rows;
      },
      get: async (...args: any[]) => {
        const params = (args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0])) ? args[0] : args;
        const res = await client.execute({ sql, args: params });
        return res.rows[0];
      },
      run: async (...args: any[]) => {
        const params = (args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0])) ? args[0] : args;
        const res = await client.execute({ sql, args: params });
        return { lastInsertRowid: res.lastInsertRowid, changes: res.rowsAffected };
      }
    };
  },
  executeMultiple: async (sql: string) => {
    return await client.executeMultiple(sql);
  }
};

// Since @libsql/client is asynchronous, we can't initialize the schema synchronously on module load.
// We will export a helper to initialize the DB if needed.
export async function initDb() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS User (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'SALES_REP',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Product (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ProductVariant (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      size TEXT,
      color TEXT,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      sku TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(productId) REFERENCES Product(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Customer (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      type TEXT DEFAULT 'Retail',
      totalSpent REAL DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "Order" (
      id TEXT PRIMARY KEY,
      customerId TEXT,
      amount REAL NOT NULL,
      paymentMethod TEXT DEFAULT 'Transfer',
      status TEXT DEFAULT 'Pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Notification (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      isRead INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Sale (
      id TEXT PRIMARY KEY,
      userId TEXT,
      customerName TEXT,
      productName TEXT,
      variantId TEXT,
      size TEXT,
      color TEXT,
      quantity INTEGER DEFAULT 1,
      amount REAL NOT NULL,
      costPrice REAL DEFAULT 0,
      profit REAL DEFAULT 0,
      paymentMethod TEXT DEFAULT 'Transfer',
      status TEXT DEFAULT 'Pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS SaleItem (
      id TEXT PRIMARY KEY,
      saleId TEXT NOT NULL,
      productId TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS RawMaterial (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      unit TEXT NOT NULL,
      quantity REAL DEFAULT 0,
      costPerUnit REAL DEFAULT 0,
      reorderLevel REAL DEFAULT 0,
      supplier TEXT,
      status TEXT DEFAULT 'In Stock'
    );

    CREATE TABLE IF NOT EXISTS ProductionRun (
      id TEXT PRIMARY KEY,
      productName TEXT NOT NULL,
      qtyProduced INTEGER NOT NULL,
      productionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      labourCost REAL DEFAULT 0,
      materialCost REAL DEFAULT 0,
      otherCosts REAL DEFAULT 0,
      totalCost REAL DEFAULT 0,
      status TEXT DEFAULT 'In Progress',
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS Expense (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS InventoryMovement (
      id TEXT PRIMARY KEY,
      productName TEXT NOT NULL,
      variantId TEXT,
      size TEXT,
      color TEXT,
      quantity INTEGER NOT NULL,
      type TEXT NOT NULL,
      reference TEXT,
      note TEXT,
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

// Export the db client directly
export default db;
