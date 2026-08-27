import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const results = [];
  
  // 1. Add date to RawMaterial
  try {
    await db.prepare('ALTER TABLE RawMaterial ADD COLUMN date DATETIME').run();
    results.push({ table: 'RawMaterial', column: 'date', status: 'Added' });
    // Backfill existing records with a current timestamp so they aren't null
    await db.prepare("UPDATE RawMaterial SET date = CURRENT_TIMESTAMP WHERE date IS NULL").run();
    results.push({ table: 'RawMaterial', column: 'date', status: 'Backfilled' });
  } catch (e: any) {
    results.push({ table: 'RawMaterial', column: 'date', status: 'Failed or already exists', error: e.message });
  }

  // 1b. Add type to Expense
  try {
    await db.prepare('ALTER TABLE Expense ADD COLUMN type TEXT DEFAULT "Operating"').run();
    results.push({ table: 'Expense', column: 'type', status: 'Added' });
  } catch (e: any) {
    results.push({ table: 'Expense', column: 'type', status: 'Failed or already exists', error: e.message });
  }

  // 2. Add costPrice to ProductVariant
  try {
    await db.prepare('ALTER TABLE ProductVariant ADD COLUMN costPrice REAL DEFAULT 0').run();
    results.push({ table: 'ProductVariant', column: 'costPrice', status: 'Added' });
  } catch (e: any) {
    results.push({ table: 'ProductVariant', column: 'costPrice', status: 'Failed or already exists', error: e.message });
  }

  // 3. Add variantId to ProductionRun
  try {
    await db.prepare('ALTER TABLE ProductionRun ADD COLUMN variantId TEXT').run();
    results.push({ table: 'ProductionRun', column: 'variantId', status: 'Added' });
  } catch (e: any) {
    results.push({ table: 'ProductionRun', column: 'variantId', status: 'Failed or already exists', error: e.message });
  }

  // 4. Add product details to Order
  const orderCols = ['productName TEXT', 'variantId TEXT', 'size TEXT', 'color TEXT', 'quantity INTEGER DEFAULT 1'];
  for (const col of orderCols) {
    try {
      await db.prepare(`ALTER TABLE "Order" ADD COLUMN ${col}`).run();
      results.push({ table: 'Order', column: col, status: 'Added' });
    } catch (e: any) {
      results.push({ table: 'Order', column: col, status: 'Failed or already exists', error: e.message });
    }
  }

  // Also initialize full schema if any tables are missing entirely
  try {
    const { initDb } = await import('@/lib/db');
    await initDb();
    results.push({ task: 'initDb', status: 'Success' });
  } catch (e: any) {
    results.push({ task: 'initDb', status: 'Failed', error: e.message });
  }

  // 5. Add discount to Sale and Order
  try {
    await db.prepare('ALTER TABLE Sale ADD COLUMN discount REAL DEFAULT 0').run();
    results.push({ table: 'Sale', column: 'discount', status: 'Added' });
  } catch (e: any) {
    results.push({ table: 'Sale', column: 'discount', status: 'Failed or already exists', error: e.message });
  }
  try {
    await db.prepare('ALTER TABLE "Order" ADD COLUMN discount REAL DEFAULT 0').run();
    results.push({ table: 'Order', column: 'discount', status: 'Added' });
  } catch (e: any) {
    results.push({ table: 'Order', column: 'discount', status: 'Failed or already exists', error: e.message });
  }

  // 5b. Sync Customer totalSpent
  try {
    // Ensure totalSpent is not null
    await db.prepare('UPDATE Customer SET totalSpent = 0 WHERE totalSpent IS NULL').run();
    
    const customers = await db.prepare('SELECT * FROM Customer').all() as any[];
    for (const c of customers) {
      const salesRes = await db.prepare('SELECT SUM(amount) as total FROM Sale WHERE customerName = ?').get(c.name) as any;
      const sum = salesRes?.total || 0;
      await db.prepare('UPDATE Customer SET totalSpent = ? WHERE id = ?').run(sum, c.id);
    }
    results.push({ task: 'syncCustomers', status: 'Success' });
  } catch (e: any) {
    results.push({ task: 'syncCustomers', status: 'Failed', error: e.message });
  }

  // 6. Recalculate Sales COGS and Profit based on current ProductVariant costPrice
  try {
    const sales = await db.prepare("SELECT * FROM Sale").all() as any[];
    for (const sale of sales) {
      // First try to find by exact variantId
      let variant = null;
      if (sale.variantId) {
        variant = await db.prepare("SELECT costPrice FROM ProductVariant WHERE id = ?").get(sale.variantId) as any;
      }
      
      // If not found (because updateProduct deletes and recreates variants), try to find by productName, size, and color
      if (!variant) {
        const product = await db.prepare("SELECT id FROM Product WHERE name = ?").get(sale.productName) as any;
        if (product) {
           variant = await db.prepare("SELECT costPrice FROM ProductVariant WHERE productId = ? AND size = ? AND color = ?").get(product.id, sale.size || '', sale.color || '') as any;
           
           // If STILL not found, just grab any variant for that product as a last resort
           if (!variant) {
             variant = await db.prepare("SELECT costPrice FROM ProductVariant WHERE productId = ?").get(product.id) as any;
           }
        }
      }

      if (variant) {
        const unitCost = variant.costPrice || 0;
        const totalCostPrice = unitCost * sale.quantity;
        const profit = sale.amount - totalCostPrice;
        await db.prepare("UPDATE Sale SET costPrice = ?, profit = ? WHERE id = ?").run(totalCostPrice, profit, sale.id);
      }
    }
    results.push({ table: 'Sale', column: 'costPrice, profit', status: 'Recalculated based on current variants' });
  } catch (e: any) {
    results.push({ table: 'Sale', column: 'costPrice, profit', status: 'Recalculation failed', error: e.message });
  }

  return NextResponse.json({ success: true, results });
}
