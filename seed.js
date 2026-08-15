const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
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
    console.log("Admin created:", admin.email);
  } else {
    console.log("Admin already exists");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
