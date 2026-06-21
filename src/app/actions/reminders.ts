"use server";

import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

async function getHouseholdId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.householdId) throw new Error("No household found");
  return user.householdId;
}

export async function getReminders() {
  const householdId = await getHouseholdId();
  return prisma.reminder.findMany({
    where: { householdId },
    orderBy: { dueDate: "asc" },
  });
}

export async function getReminderGroups() {
  const householdId = await getHouseholdId();
  return prisma.reminderGroup.findMany({
    where: { householdId },
    orderBy: { createdAt: "asc" },
  });
}

export async function addReminder(label: string, dueDate: string, groupId?: string | null) {
  const householdId = await getHouseholdId();
  await prisma.reminder.create({
    data: {
      label,
      dueDate: new Date(dueDate),
      householdId,
      groupId: groupId || null,
    },
  });
  revalidatePath("/dashboard/reminders");
  revalidatePath("/dashboard");
}

export async function deleteReminder(id: string) {
  await prisma.reminder.delete({ where: { id } });
  revalidatePath("/dashboard/reminders");
  revalidatePath("/dashboard");
}

export async function moveReminderToGroup(id: string, groupId: string | null) {
  await prisma.reminder.update({
    where: { id },
    data: { groupId: groupId || null },
  });
  revalidatePath("/dashboard/reminders");
}

export async function addReminderGroup(name: string, color = "slate") {
  const householdId = await getHouseholdId();
  const group = await prisma.reminderGroup.create({
    data: { name, color, householdId },
  });
  revalidatePath("/dashboard/reminders");
  return group;
}

export async function renameReminderGroup(id: string, name: string) {
  await prisma.reminderGroup.update({ where: { id }, data: { name } });
  revalidatePath("/dashboard/reminders");
}

export async function deleteReminderGroup(id: string) {
  // Reminders in this group are kept; their groupId is set to null (onDelete: SetNull).
  await prisma.reminderGroup.delete({ where: { id } });
  revalidatePath("/dashboard/reminders");
}
