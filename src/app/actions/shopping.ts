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

export async function getShoppingItems() {
  const householdId = await getHouseholdId();
  return prisma.shoppingItem.findMany({
    where: { householdId },
    orderBy: { createdAt: "asc" },
  });
}

export async function addShoppingItem(label: string, category: string) {
  const householdId = await getHouseholdId();
  const newItem = await prisma.shoppingItem.create({
    data: { label, category, householdId },
  });
  return newItem;
}

export async function toggleShoppingItem(id: string, done: boolean) {
  await prisma.shoppingItem.update({
    where: { id },
    data: { done },
  });
  revalidatePath("/dashboard/shopping");
}

export async function deleteShoppingItem(id: string) {
  await prisma.shoppingItem.delete({ where: { id } });
  revalidatePath("/dashboard/shopping");
}

