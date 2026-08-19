import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const results = [];
  
  // 1. Add type to Expense
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

  // 6. Recalculate Sales COGS and Profit based on current ProductVariant costPrice
  try {
    const sales = await db.prepare("SELECT * FROM Sale").all() as any[];
    for (const sale of sales) {
      if (sale.variantId) {
        const variant = await db.prepare("SELECT costPrice FROM ProductVariant WHERE id = ?").get(sale.variantId) as any;
        if (variant) {
          const unitCost = variant.costPrice || 0;
          const totalCostPrice = unitCost * sale.quantity;
          const profit = sale.amount - totalCostPrice;
          await db.prepare("UPDATE Sale SET costPrice = ?, profit = ? WHERE id = ?").run(totalCostPrice, profit, sale.id);
        }
      }
    }
    results.push({ table: 'Sale', column: 'costPrice, profit', status: 'Recalculated based on current variants' });
  } catch (e: any) {
    results.push({ table: 'Sale', column: 'costPrice, profit', status: 'Recalculation failed', error: e.message });
  }

  return NextResponse.json({ success: true, results });
}
