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
      sku TEXT DEFAULT '',
      category TEXT DEFAULT 'Footwear',
      brand TEXT DEFAULT 'MLAZ',
      material TEXT DEFAULT '',
      description TEXT DEFAULT '',
      reorderLevel INTEGER DEFAULT 5,
      wholesaleMinQty INTEGER DEFAULT 6,
      status TEXT DEFAULT 'Active',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ProductVariant (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      size TEXT,
      color TEXT,
      price REAL NOT NULL,
      wholesalePrice REAL DEFAULT 0,
      costPrice REAL DEFAULT 0,
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
      orderType TEXT DEFAULT 'Retail',
      productName TEXT,
      variantId TEXT,
      size TEXT,
      color TEXT,
      quantity INTEGER DEFAULT 1,
      amount REAL NOT NULL,
      discount REAL DEFAULT 0,
      vatAmount REAL DEFAULT 0,
      amountPaid REAL DEFAULT 0,
      paymentStatus TEXT DEFAULT 'Unpaid',
      paymentMethod TEXT DEFAULT 'Transfer',
      status TEXT DEFAULT 'Pending',
      dueDate DATETIME,
      notes TEXT DEFAULT '',
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
      saleType TEXT DEFAULT 'Retail',
      customerName TEXT,
      productName TEXT,
      variantId TEXT,
      size TEXT,
      color TEXT,
      quantity INTEGER DEFAULT 1,
      amount REAL NOT NULL,
      discount REAL DEFAULT 0,
      vatAmount REAL DEFAULT 0,
      amountPaid REAL,
      paymentStatus TEXT DEFAULT 'Paid',
      costPrice REAL DEFAULT 0,
      profit REAL DEFAULT 0,
      paymentMethod TEXT DEFAULT 'Transfer',
      status TEXT DEFAULT 'Pending',
      dueDate DATETIME,
      notes TEXT DEFAULT '',
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
      status TEXT DEFAULT 'In Stock',
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ProductionRun (
      id TEXT PRIMARY KEY,
      productName TEXT NOT NULL,
      variantId TEXT,
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
      type TEXT DEFAULT 'Operating',
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

    CREATE TABLE IF NOT EXISTS FixedAsset (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      acquisitionDate DATETIME NOT NULL,
      cost REAL NOT NULL,
      residualValue REAL DEFAULT 0,
      usefulLifeYears REAL DEFAULT 5,
      depreciationMethod TEXT DEFAULT 'Straight-Line',
      revaluationSurplus REAL DEFAULT 0,
      disposalDate DATETIME,
      disposalProceeds REAL DEFAULT 0,
      disposalPaymentStatus TEXT DEFAULT 'Cash',
      paymentStatus TEXT DEFAULT 'Paid',
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS FinancialEntry (
      id TEXT PRIMARY KEY,
      entryType TEXT NOT NULL,
      section TEXT NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      date DATETIME NOT NULL,
      reference TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS FinancialSettings (
      id TEXT PRIMARY KEY,
      companyLegalName TEXT DEFAULT 'MLAZ LIMITED',
      rcNumber TEXT DEFAULT 'RC-1849201',
      tinNumber TEXT DEFAULT '20491827-0001',
      financialYearStartMonth INTEGER DEFAULT 1,
      taxRegime TEXT DEFAULT 'AUTO',
      enableTET INTEGER DEFAULT 1,
      enablePoliceLevy INTEGER DEFAULT 0,
      vatRate REAL DEFAULT 7.5,
      preparedBy TEXT DEFAULT 'Financial Controller',
      approvedBy TEXT DEFAULT 'Managing Director',
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

let financialTablesInitialized = false;

export async function ensureFinancialTables() {
  if (financialTablesInitialized) return;
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS FixedAsset (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      acquisitionDate DATETIME NOT NULL,
      cost REAL NOT NULL,
      residualValue REAL DEFAULT 0,
      usefulLifeYears REAL DEFAULT 5,
      depreciationMethod TEXT DEFAULT 'Straight-Line',
      revaluationSurplus REAL DEFAULT 0,
      disposalDate DATETIME,
      disposalProceeds REAL DEFAULT 0,
      disposalPaymentStatus TEXT DEFAULT 'Cash',
      paymentStatus TEXT DEFAULT 'Paid',
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS FinancialEntry (
      id TEXT PRIMARY KEY,
      entryType TEXT NOT NULL,
      section TEXT NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      date DATETIME NOT NULL,
      reference TEXT,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS FinancialSettings (
      id TEXT PRIMARY KEY,
      companyLegalName TEXT DEFAULT 'MLAZ LIMITED',
      rcNumber TEXT DEFAULT 'RC-1849201',
      tinNumber TEXT DEFAULT '20491827-0001',
      financialYearStartMonth INTEGER DEFAULT 1,
      taxRegime TEXT DEFAULT 'AUTO',
      enableTET INTEGER DEFAULT 1,
      enablePoliceLevy INTEGER DEFAULT 0,
      vatRate REAL DEFAULT 7.5,
      preparedBy TEXT DEFAULT 'Financial Controller',
      approvedBy TEXT DEFAULT 'Managing Director',
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  try {
    await db.prepare("ALTER TABLE FixedAsset ADD COLUMN disposalPaymentStatus TEXT DEFAULT 'Cash'").run();
  } catch {
    // Column already exists
  }

  const existingSettings = await db.prepare("SELECT id FROM FinancialSettings WHERE id = 'default'").get();
  if (!existingSettings) {
    await db.prepare(`
      INSERT INTO FinancialSettings (id, companyLegalName, rcNumber, tinNumber, financialYearStartMonth, taxRegime, enableTET, enablePoliceLevy, vatRate, preparedBy, approvedBy)
      VALUES ('default', 'MLAZ LIMITED', 'RC-1849201', '20491827-0001', 1, 'AUTO', 1, 0, 7.5, 'Financial Controller', 'Managing Director')
    `).run();
  }

  financialTablesInitialized = true;
}

let productColumnsInitialized = false;

export async function ensureProductColumns() {
  if (productColumnsInitialized) return;
  const alterCols = [
    "ALTER TABLE Product ADD COLUMN sku TEXT DEFAULT ''",
    "ALTER TABLE Product ADD COLUMN category TEXT DEFAULT 'Footwear'",
    "ALTER TABLE Product ADD COLUMN brand TEXT DEFAULT 'MLAZ'",
    "ALTER TABLE Product ADD COLUMN material TEXT DEFAULT ''",
    "ALTER TABLE Product ADD COLUMN description TEXT DEFAULT ''",
    "ALTER TABLE Product ADD COLUMN reorderLevel INTEGER DEFAULT 5",
    "ALTER TABLE Product ADD COLUMN wholesaleMinQty INTEGER DEFAULT 6",
    "ALTER TABLE Product ADD COLUMN status TEXT DEFAULT 'Active'",
    "ALTER TABLE ProductVariant ADD COLUMN costPrice REAL DEFAULT 0",
    "ALTER TABLE ProductVariant ADD COLUMN wholesalePrice REAL DEFAULT 0",
  ];
  for (const sql of alterCols) {
    try {
      await db.prepare(sql).run();
    } catch {
      // Column already exists
    }
  }
  productColumnsInitialized = true;
}

let salesOrderColumnsInitialized = false;

export async function ensureSalesAndOrderColumns() {
  if (salesOrderColumnsInitialized) return;
  const alterCols = [
    "ALTER TABLE Sale ADD COLUMN saleType TEXT DEFAULT 'Retail'",
    "ALTER TABLE Sale ADD COLUMN vatAmount REAL DEFAULT 0",
    "ALTER TABLE Sale ADD COLUMN amountPaid REAL",
    "ALTER TABLE Sale ADD COLUMN paymentStatus TEXT DEFAULT 'Paid'",
    "ALTER TABLE Sale ADD COLUMN dueDate DATETIME",
    "ALTER TABLE Sale ADD COLUMN notes TEXT DEFAULT ''",
    'ALTER TABLE "Order" ADD COLUMN orderType TEXT DEFAULT \'Retail\'',
    'ALTER TABLE "Order" ADD COLUMN vatAmount REAL DEFAULT 0',
    'ALTER TABLE "Order" ADD COLUMN amountPaid REAL DEFAULT 0',
    'ALTER TABLE "Order" ADD COLUMN paymentStatus TEXT DEFAULT \'Unpaid\'',
    'ALTER TABLE "Order" ADD COLUMN dueDate DATETIME',
    'ALTER TABLE "Order" ADD COLUMN notes TEXT DEFAULT \'\'',
  ];
  for (const sql of alterCols) {
    try {
      await db.prepare(sql).run();
    } catch {
      // Column already exists
    }
  }
  salesOrderColumnsInitialized = true;
}

// Export the db client directly
export default db;
