"use server";

import db from "@/lib/db";

export async function getNotificationsAction() {
  try {
    const rawNotifications = await db.prepare('SELECT * FROM Notification ORDER BY createdAt DESC').all() as any[];
    return { success: true, notifications: rawNotifications.map(n => ({ ...n })) };
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
