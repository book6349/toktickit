// Synthetic, stable-key Lab 4 fixtures. Existing actions/history are never rewritten.
export async function seedLab4Actions(prisma: any, users: Map<string, any>) {
  const staff = users.get("somchai.staff@example.com");
  const colleague = users.get("kanya.staff@example.com");
  const admin = users.get("admin@example.com");
  const fixtures = [
    { key: "lab4-network-planned", ticket: "TT-20260919-000001", status: "PLANNED", assigneeId: colleague.id,
      description: "Inspect wireless adapter policy.", result: "Inspection scheduled.", followUpRequired: true, followUpNote: "Confirm the device policy with the Requester." },
    { key: "lab4-network-completed", ticket: "TT-20260919-000001", status: "COMPLETED", assigneeId: staff.id,
      description: "Check the saved wireless profile.", result: "The existing profile was confirmed.", followUpRequired: false, followUpNote: null },
    { key: "lab4-network-cancelled", ticket: "TT-20260919-000001", status: "CANCELLED", assigneeId: admin.id,
      description: "Consider replacing the wireless adapter.", result: "Replacement was unnecessary.", followUpRequired: false, followUpNote: null },
    { key: "lab4-mail-in-progress", ticket: "TT-20260919-000002", status: "IN_PROGRESS", assigneeId: admin.id,
      description: "Review shared mailbox permissions.", result: "Permission review is underway.", followUpRequired: false, followUpNote: null },
  ];
  for (const fixture of fixtures) {
    await prisma.$transaction(async (tx: any) => {
      if (await tx.actionTaken.findUnique({ where: { seedKey: fixture.key } })) return;
      const ticket = await tx.ticket.findUnique({ where: { ticketNumber: fixture.ticket } });
      const action = await tx.actionTaken.create({ data: {
        seedKey: fixture.key, ticketId: ticket.id, actionDateTime: new Date("2026-10-28T08:00:00Z"),
        performedById: staff.id, assigneeId: fixture.assigneeId, status: fixture.status,
        description: fixture.description, result: fixture.result, followUpRequired: fixture.followUpRequired,
        followUpNote: fixture.followUpNote, attachmentNotes: null,
      } });
      await tx.actionTakenEvent.create({ data: { actionId: action.id, actorId: staff.id, kind: "CREATED",
        toStatus: fixture.status, version: 1,
        changedFields: ["actionDateTime", "description", "result", "assigneeId", "status", "followUpRequired", "followUpNote", "attachmentNotes"] } });
      await tx.ticket.update({ where: { id: ticket.id }, data: { workflowVersion: { increment: 1 } } });
    });
  }
}
