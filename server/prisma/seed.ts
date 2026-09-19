import { hashPassword } from "../src/auth.js";
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
  const users = [
    { name: "Ariya Somchai", email: "ariya.somchai@example.com", role: "REQUESTER", isActive: true },
    { name: "Narin Kittisak", email: "narin.kittisak@example.com", role: "REQUESTER", isActive: true },
    { name: "Mali Chantarangsu", email: "mali.chantarangsu@example.com", role: "REQUESTER", isActive: true },
    { name: "Pimchanok Rattanakul", email: "pimchanok.rattanakul@example.com", role: "REQUESTER", isActive: true },
    { name: "Inactive Requester", email: "inactive@example.com", role: "REQUESTER", isActive: false },
    { name: "Somchai Staff", email: "somchai.staff@example.com", role: "IT_STAFF", isActive: true },
    { name: "Kanya Staff", email: "kanya.staff@example.com", role: "IT_STAFF", isActive: true },
    { name: "Nopparat Staff", email: "nopparat.staff@example.com", role: "IT_STAFF", isActive: true },
    { name: "Inactive Staff", email: "inactive.staff@example.com", role: "IT_STAFF", isActive: false },
    { name: "Admin User", email: "admin@example.com", role: "ADMINISTRATOR", isActive: true },
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
  const passwordHash = hashPassword("Local-development-password");
  const userByEmail = new Map<string, any>();
  for (const user of users) {
    const record = await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, isActive: user.isActive },
      create: { ...user, passwordHash, mustChangePassword: true },
    });
    userByEmail.set(user.email, record);
  }

  const categoryByName = new Map<string, any>((await prisma.category.findMany({ where: { name: { in: categories } } })).map((item: any) => [item.name, item]));
  const systemByName = new Map<string, any>((await prisma.relatedSystem.findMany({ where: { name: { in: systems } } })).map((item: any) => [item.name, item]));
  const seededTickets = [
    { number: "TT-20260919-000001", requester: "ariya.somchai@example.com", category: "Hardware", system: "Corporate Laptop", requested: "HIGH", status: "OPEN", summary: "Laptop cannot connect to Wi-Fi", description: "The corporate laptop disconnects from the office wireless network.", owner: "somchai.staff@example.com" },
    { number: "TT-20260919-000002", requester: "narin.kittisak@example.com", category: "Account and Access", system: "Corporate Email", requested: "MEDIUM", status: "IN_PROGRESS", summary: "Email access request", description: "Please restore access to the shared finance mailbox.", owner: "kanya.staff@example.com" },
    { number: "TT-20260919-000003", requester: "mali.chantarangsu@example.com", category: "Network", system: "VPN", requested: "LOW", status: "NEW", summary: "VPN access request", description: "A new starter needs VPN access for remote work.", owner: null },
  ];
  for (const item of seededTickets) {
    const requester = userByEmail.get(item.requester);
    const owner = item.owner ? userByEmail.get(item.owner) : null;
    const ticketData = {
      requesterId: requester.id,
      categoryId: categoryByName.get(item.category).id,
      relatedSystemId: systemByName.get(item.system).id,
      requestedPriority: item.requested,
      itPriority: item.requested,
      status: item.status,
      summary: item.summary,
      description: item.description,
      ownerId: owner?.id ?? null,
    };
    const ticket = await prisma.ticket.upsert({
      where: { ticketNumber: item.number },
      update: ticketData,
      create: { ticketNumber: item.number, ...ticketData },
    });
    const comment = { ticketId: ticket.id, authorId: requester.id, content: "I am available to test the fix when it is ready." };
    if (!(await prisma.publicComment.findFirst({ where: comment }))) await prisma.publicComment.create({ data: comment });
    const note = { ticketId: ticket.id, authorId: owner?.id ?? userByEmail.get("somchai.staff@example.com").id, content: "Seeded internal triage note for local development." };
    if (!(await prisma.internalNote.findFirst({ where: note }))) await prisma.internalNote.create({ data: note });
  }
  console.log(`Seeding completed successfully: ${users.length} users and ${seededTickets.length} tickets.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await getPrisma().$disconnect();
  });
