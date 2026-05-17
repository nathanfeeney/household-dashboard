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

export async function getTodoItems() {
  const householdId = await getHouseholdId();
  return prisma.todoItem.findMany({
    where: { householdId },
    orderBy: { createdAt: "asc" },
  });
}

export async function addTodoItem(label: string, assignedTo: string | null) {
  const householdId = await getHouseholdId();
  await prisma.todoItem.create({
    data: { label, assignedTo, householdId },
  });
  revalidatePath("/dashboard/todo");
}

export async function toggleTodoItem(id: string, done: boolean) {
  await prisma.todoItem.update({
    where: { id },
    data: { done },
  });
  revalidatePath("/dashboard/todo");
}

export async function deleteTodoItem(id: string) {
  await prisma.todoItem.delete({ where: { id } });
  revalidatePath("/dashboard/todo");
}