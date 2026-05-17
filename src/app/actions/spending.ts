"use server";

import { prisma } from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

async function getHouseholdIdAndUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.householdId) throw new Error("No household found");
  return { householdId: user.householdId, userId: user.id };
}

export async function getSpendingEntries(month: number, year: number) {
  const { householdId } = await getHouseholdIdAndUser();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59);
  return prisma.spendingEntry.findMany({
    where: { householdId, date: { gte: start, lte: end } },
    orderBy: { date: "desc" },
    include: { addedBy: { select: { name: true, email: true } } },
  });
}

export async function addSpendingEntry(label: string, amount: number, category: string, date: string) {
  const { householdId, userId } = await getHouseholdIdAndUser();
  await prisma.spendingEntry.create({
    data: { label, amount, category, date: new Date(date), householdId, addedById: userId },
  });
  revalidatePath("/dashboard/spending");
}

export async function deleteSpendingEntry(id: string) {
  await prisma.spendingEntry.delete({ where: { id } });
  revalidatePath("/dashboard/spending");
}