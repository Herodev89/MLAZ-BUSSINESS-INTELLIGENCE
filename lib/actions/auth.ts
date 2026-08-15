"use server";

import { cookies } from "next/headers";
import { encrypt, clearSession } from "@/lib/auth";
import db from "@/lib/db";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export async function loginAction(formData: FormData) {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const user = await db.prepare('SELECT * FROM User WHERE email = ?').get(email) as any;

  if (!user) {
    return { error: "Invalid email or password" };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return { error: "Invalid email or password" };
  }

  // Create session
  const session = await encrypt({ id: user.id, name: user.name, email: user.email, role: user.role });
  cookies().set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return { success: true, user: { name: user.name, role: user.role } };
}

export async function logoutAction() {
  await clearSession();
  return { success: true };
}

export async function createSalesRepAction(formData: FormData) {
  const name = formData.get("name")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required" };
  }

  const existingUser = await db.prepare('SELECT * FROM User WHERE email = ?').get(email);

  if (existingUser) {
    return { error: "User with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const id = randomUUID();

  const role = formData.get("role")?.toString() || "SALES_REP";

  await db.prepare(`
    INSERT INTO User (id, name, email, passwordHash, role)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, name, email, passwordHash, role);

  return { success: true, user: { name, email } };
}

export async function getUsersAction() {
  try {
    const users = await db.prepare('SELECT id, name, email, role, createdAt FROM User ORDER BY createdAt DESC').all();
    return { success: true, users };
  } catch (error) {
    return { error: "Failed to fetch users" };
  }
}

export async function deleteUserAction(id: string) {
  try {
    await db.prepare('DELETE FROM User WHERE id = ?').run(id);
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete user" };
  }
}
