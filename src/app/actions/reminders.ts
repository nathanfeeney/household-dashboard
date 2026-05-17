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

export async function addReminder(label: string, dueDate: string) {
  const householdId = await getHouseholdId();
  await prisma.reminder.create({
    data: { label, dueDate: new Date(dueDate), householdId },
  });
  revalidatePath("/dashboard/reminders");
}

export async function deleteReminder(id: string) {
  await prisma.reminder.delete({ where: { id } });
  revalidatePath("/dashboard/reminders");
}