import db from './lib/db';
import { randomUUID } from 'crypto';

async function generateHistory() {
  const months = [2, 3, 4, 5, 6, 7]; // March to August
  const products = [
    { name: 'Argan Oil 50ml', price: 4500, cost: 2000 },
    { name: 'Whipped Shea Butter 250g', price: 9000, cost: 4000 },
    { name: 'African Black Soap', price: 3500, cost: 1500 },
    { name: 'Coconut Oil 100ml', price: 3000, cost: 1000 },
    { name: 'Turmeric Face Mask 50g', price: 6000, cost: 2500 }
  ];
  
  const insertSale = db.prepare('INSERT INTO Sale (id, customerName, productName, quantity, amount, profit, paymentMethod, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  
  const paymentMethods = ['Transfer', 'POS', 'Cash'];
  
  console.log('Generating historical sales data...');
  
  for (const month of months) {
    // Generate 5-15 sales per month
    const numSales = Math.floor(Math.random() * 10) + 5;
    
    for (let i = 0; i < numSales; i++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const qty = Math.floor(Math.random() * 3) + 1;
      const amount = product.price * qty;
      const profit = (product.price - product.cost) * qty;
      
      const payment = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      // Random day in the month
      const day = Math.floor(Math.random() * 28) + 1;
      const dateStr = `2026-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T10:00:00.000Z`;
      
      insertSale.run(
        `TX-HIST-${Math.floor(1000 + Math.random() * 9000)}`,
        'Walk-in Customer',
        product.name,
        qty,
        amount,
        profit,
        payment,
        'Confirmed',
        dateStr
      );
    }
  }
  
  console.log('Historical data injected successfully!');
}

generateHistory().catch(console.error);
