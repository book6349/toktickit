import { getPrisma } from "../src/prisma.js";

async function main() {
  const prisma = getPrisma();
  const categories = ["Account and Access", "Hardware", "Software", "Network"];
  const systems = [
    "Corporate Laptop",
    "Corporate Email",
    "VPN",
    "Wi-Fi",
    "HR Portal",
    "Finance System",
  ];
  const requesters = [
    { name: "Ariya Somchai", email: "ariya.somchai@example.com", isActive: true },
    { name: "Narin Kittisak", email: "narin.kittisak@example.com", isActive: true },
    { name: "Mali Chantarangsu", email: "mali.chantarangsu@example.com", isActive: true },
    { name: "Pimchanok Rattanakul", email: "pimchanok.rattanakul@example.com", isActive: true },
    { name: "Inactive Example", email: "inactive@example.com", isActive: false },
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: { isActive: true },
      create: { name, isActive: true },
    });
  }
  for (const name of systems) {
    await prisma.relatedSystem.upsert({
      where: { name },
      update: { isActive: true },
      create: { name, isActive: true },
    });
  }
  for (const requester of requesters) {
    await prisma.requesterUser.upsert({
      where: { email: requester.email },
      update: requester,
      create: requester,
    });
  }
  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
