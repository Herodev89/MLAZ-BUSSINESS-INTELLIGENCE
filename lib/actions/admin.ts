"use server";

import db from "@/lib/db";

export async function clearDatabaseAction(adminPasswordConfirm: string) {
  // In a real app, you would verify the admin password or session token here.
  // We'll skip password validation for simplicity in this demo, but the field is required.
  if (adminPasswordConfirm !== "CONFIRM-CLEAR") {
    return { error: "Invalid confirmation code." };
  }

  try {
    // Truncate operational data but keep users and system settings
    const tables = [
      'Sale',
      'SaleItem',
      '"Order"',
      'InventoryMovement',
      'ProductionRun',
      'RawMaterial',
      'Expense',
      'ProductVariant',
      'Product',
      'Customer',
      'Notification',
      'FixedAsset',
      'FinancialEntry',
    ];
    for (const tbl of tables) {
      try {
        await db.prepare(`DELETE FROM ${tbl}`).run();
      } catch {
        // Ignore if optional table hasn't been created yet
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Clear DB Error:", error);
    return { error: "Failed to clear database." };
  }
}
