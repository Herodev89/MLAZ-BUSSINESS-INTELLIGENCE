import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@mlaz.com" },
    });

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash("admin123", 10);
      const admin = await prisma.user.create({
        data: {
          name: "System Admin",
          email: "admin@mlaz.com",
          passwordHash,
          role: "ADMIN",
        },
      });
      return NextResponse.json({ message: "Admin created", email: admin.email });
    } else {
      return NextResponse.json({ message: "Admin already exists" });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
