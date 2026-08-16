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
    await db.prepare('DELETE FROM SalesTransaction').run();
    await db.prepare('DELETE FROM InventoryMovement').run();
    await db.prepare('DELETE FROM ProductionRun').run();
    await db.prepare('DELETE FROM RawMaterial').run();
    await db.prepare('DELETE FROM Expense').run();
    await db.prepare('DELETE FROM ProductVariant').run();
    await db.prepare('DELETE FROM Product').run();
    await db.prepare('DELETE FROM Customer').run();
    await db.prepare('DELETE FROM Notification').run();

    return { success: true };
  } catch (error) {
    console.error("Clear DB Error:", error);
    return { error: "Failed to clear database." };
  }
}
