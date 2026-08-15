"use server";

import db from "@/lib/db";

export async function getNotificationsAction() {
  try {
    const notifications = await db.prepare('SELECT * FROM Notification ORDER BY createdAt DESC').all();
    return { success: true, notifications };
  } catch (error) {
    return { error: "Failed to fetch notifications" };
  }
}

export async function markNotificationAsReadAction(id: string) {
  try {
    await db.prepare('UPDATE Notification SET isRead = 1 WHERE id = ?').run(id);
    return { success: true };
  } catch (error) {
    return { error: "Failed to update notification" };
  }
}
