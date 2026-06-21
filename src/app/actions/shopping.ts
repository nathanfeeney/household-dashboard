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

export async function getShoppingGroups() {
  const householdId = await getHouseholdId();
  return prisma.shoppingGroup.findMany({
    where: { householdId },
    orderBy: { createdAt: "asc" },
  });
}

export async function clearShoppingList(groupId?: string | null) {
  const householdId = await getHouseholdId();
  // When a group is passed, only clear that group's items; otherwise clear all.
  await prisma.shoppingItem.deleteMany({
    where: groupId === undefined ? { householdId } : { householdId, groupId: groupId || null },
  });
  revalidatePath("/dashboard/shopping");
}

export async function addShoppingItem(label: string, category: string, groupId?: string | null) {
  const householdId = await getHouseholdId();
  const newItem = await prisma.shoppingItem.create({
    data: { label, category, householdId, groupId: groupId || null },
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

export async function moveShoppingItemToGroup(id: string, groupId: string | null) {
  await prisma.shoppingItem.update({
    where: { id },
    data: { groupId: groupId || null },
  });
  revalidatePath("/dashboard/shopping");
}

export async function addShoppingGroup(name: string, color = "slate") {
  const householdId = await getHouseholdId();
  const group = await prisma.shoppingGroup.create({
    data: { name, color, householdId },
  });
  revalidatePath("/dashboard/shopping");
  return group;
}

export async function renameShoppingGroup(id: string, name: string) {
  await prisma.shoppingGroup.update({ where: { id }, data: { name } });
  revalidatePath("/dashboard/shopping");
}

export async function deleteShoppingGroup(id: string) {
  // Items in this group are kept; their groupId is set to null (onDelete: SetNull).
  await prisma.shoppingGroup.delete({ where: { id } });
  revalidatePath("/dashboard/shopping");
}
