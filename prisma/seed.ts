import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create tables
  const tables = await Promise.all(
    Array.from({ length: 10 }, (_, i) =>
      prisma.table.create({
        data: { name: `Masa ${i + 1}`, capacity: 8 },
      })
    )
  );

  // Create sample guests
  await prisma.guest.createMany({
    data: [
      { name: "Maria Popescu", email: "maria@example.com", attending: "yes", plusOne: true, plusOneName: "Ion Popescu", tableId: tables[0].id },
      { name: "Ana Ionescu", email: "ana@example.com", attending: "yes", plusOne: false, tableId: tables[0].id },
      { name: "Mihai Georgescu", attending: "pending", plusOne: true },
      { name: "Elena Dumitrescu", email: "elena@example.com", attending: "no", plusOne: false, message: "Ne pare rău, nu putem ajunge!" },
      { name: "Alexandru Popa", attending: "pending", plusOne: true, plusOneName: "Cristina Popa" },
    ],
  });

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
