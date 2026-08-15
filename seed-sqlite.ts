import db, { initDb } from './lib/db';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

async function seed() {
  await initDb();
  await db.executeMultiple(`
    DELETE FROM SaleItem;
    DELETE FROM Sale;
    DELETE FROM InventoryMovement;
    DELETE FROM ProductionRun;
    DELETE FROM RawMaterial;
    DELETE FROM "Order";
    DELETE FROM Customer;
    DELETE FROM Notification;
    DELETE FROM ProductVariant;
    DELETE FROM Product;
    DELETE FROM User;
    DELETE FROM Expense;
  `);

  console.log('Cleared existing data.');

  // Create Admin User
  const adminId = randomUUID();
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  await db.prepare(`
    INSERT INTO User (id, name, email, passwordHash, role, updatedAt)
    VALUES (?, 'Admin User', 'admin@mlaz.com', ?, 'ADMIN', CURRENT_TIMESTAMP)
  `).run(adminId, passwordHash);

  console.log('Admin created.');

  // Create Notifications
  const insertNotif = await db.prepare('INSERT INTO Notification (id, title, message, type) VALUES (?, ?, ?, ?)');
  await insertNotif.run(randomUUID(), 'Low Stock Alert', 'Shea Butter is running low.', 'warning');
  await insertNotif.run(randomUUID(), 'New Order', 'Order #1029 was just placed.', 'info');

  console.log('Notifications added.');

  // Create Customers
  const insertCustomer = await db.prepare('INSERT INTO Customer (id, name, email, phone) VALUES (?, ?, ?, ?)');
  const cust1 = randomUUID();
  const cust2 = randomUUID();
  await insertCustomer.run(cust1, 'John Doe', 'john@example.com', '08012345678');
  await insertCustomer.run(cust2, 'Jane Smith', 'jane@example.com', '09087654321');

  console.log('Customers added.');

  // Create Products & Variants
  const insertProduct = await db.prepare('INSERT INTO Product (id, name) VALUES (?, ?)');
  const insertVariant = await db.prepare('INSERT INTO ProductVariant (id, productId, size, color, price, stock, sku) VALUES (?, ?, ?, ?, ?, ?, ?)');
  
  const prod1 = randomUUID();
  await insertProduct.run(prod1, 'Classic Pams');
  const var1 = randomUUID();
  await insertVariant.run(var1, prod1, '41', 'Black', 25000, 30, 'PAMS-41-BLK');
  const var2 = randomUUID();
  await insertVariant.run(var2, prod1, '42', 'Brown', 25000, 15, 'PAMS-42-BRN');

  const prod2 = randomUUID();
  await insertProduct.run(prod2, 'Leather Sandals');
  const var3 = randomUUID();
  await insertVariant.run(var3, prod2, '40', 'Black', 15000, 50, 'SNDL-40-BLK');
  const var4 = randomUUID();
  await insertVariant.run(var4, prod2, '43', 'Brown', 15000, 20, 'SNDL-43-BRN');
  
  console.log('Sample products & variants added.');

  // Create Sales
  const insertSale = await db.prepare('INSERT INTO Sale (id, customerName, productName, variantId, size, color, quantity, amount, paymentMethod, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  await insertSale.run(`TX-${Math.floor(1000 + Math.random() * 9000)}`, 'Walk-in Customer', 'Leather Sandals', var3, '40', 'Black', 2, 30000, 'POS', 'Confirmed');
  await insertSale.run(`TX-${Math.floor(1000 + Math.random() * 9000)}`, 'Jane Smith', 'Classic Pams', var1, '41', 'Black', 1, 25000, 'Transfer', 'Pending');

  console.log('Sales added.');

  // Create Orders
  const insertOrder = await db.prepare('INSERT INTO "Order" (id, customerId, amount, paymentMethod, status) VALUES (?, ?, ?, ?, ?)');
  await insertOrder.run(`ORD-${Math.floor(1000 + Math.random() * 9000)}`, cust1, 15000, 'Transfer', 'Pending');

  console.log('Orders added.');

  // Create Raw Materials
  const insertRaw = await db.prepare('INSERT INTO RawMaterial (id, name, unit, quantity, costPerUnit, reorderLevel, supplier, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  await insertRaw.run('RM-001', 'Unrefined Shea Butter', 'kg', 50, 1200, 10, 'Ogbomosho Farms', 'In Stock');
  await insertRaw.run('RM-002', 'Coconut Oil', 'litres', 20, 3500, 5, 'Lagos Oils Ltd', 'In Stock');
  await insertRaw.run('RM-003', 'Essential Oils Mix', 'bottles', 2, 8000, 5, 'Beauty Supplies NG', 'Low Stock');
  console.log('Raw Materials added.');

  // Create Production Runs
  const insertProd = await db.prepare('INSERT INTO ProductionRun (id, productName, qtyProduced, labourCost, materialCost, otherCosts, totalCost, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  await insertProd.run('PRD-001', 'Whipped Shea Butter 250g', 50, 5000, 15000, 2000, 22000, 'Completed');
  await insertProd.run('PRD-002', 'African Black Soap', 100, 10000, 25000, 5000, 40000, 'In Progress');
  console.log('Production Runs added.');

  // Create Expenses
  const insertExp = await db.prepare('INSERT INTO Expense (id, name, category, amount, description) VALUES (?, ?, ?, ?, ?)');
  await insertExp.run('EXP-001', 'Store Rent', 'Rent', 150000, 'Monthly rent for August');
  await insertExp.run('EXP-002', 'Electricity Bill', 'Electricity', 20000, 'Ikeja Electric prepay');
  await insertExp.run('EXP-003', 'Facebook Ads', 'Marketing', 30000, 'Boosted posts for new arrivals');
  console.log('Expenses added.');

  // Create Inventory Movements
  const insertMov = await db.prepare('INSERT INTO InventoryMovement (id, productName, variantId, size, color, quantity, type, reference, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  await insertMov.run('IM-001', 'Leather Sandals', var3, '40', 'Black', 50, 'Production', 'PRD-001', 'Batch 1 completed');
  await insertMov.run('IM-002', 'Classic Pams', var1, '41', 'Black', -1, 'Sale', 'TX-9021', 'Sold to Walk-in');
  console.log('Inventory Movements added.');

  console.log('Seed complete.');
}

seed().catch(console.error);
