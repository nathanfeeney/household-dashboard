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

/* ---------- Monthly bills ---------- */

export async function getMonthlyBills() {
  const householdId = await getHouseholdId();
  return prisma.monthlyBill.findMany({
    where: { householdId },
    orderBy: [{ dueDay: "asc" }, { createdAt: "asc" }],
  });
}

export async function addMonthlyBill(label: string, amount: number, dueDay?: number | null) {
  const householdId = await getHouseholdId();
  await prisma.monthlyBill.create({
    data: {
      label,
      amount,
      dueDay: dueDay && dueDay >= 1 && dueDay <= 31 ? dueDay : null,
      householdId,
    },
  });
  revalidatePath("/dashboard/bills");
  revalidatePath("/dashboard/spending");
  revalidatePath("/dashboard");
}

export async function deleteMonthlyBill(id: string) {
  await prisma.monthlyBill.delete({ where: { id } });
  revalidatePath("/dashboard/bills");
  revalidatePath("/dashboard/spending");
  revalidatePath("/dashboard");
}

/* ---------- Income sources ---------- */

export async function getIncomeSources() {
  const householdId = await getHouseholdId();
  return prisma.incomeSource.findMany({
    where: { householdId },
    orderBy: { createdAt: "asc" },
  });
}

export async function addIncomeSource(label: string, amount: number) {
  const householdId = await getHouseholdId();
  await prisma.incomeSource.create({
    data: { label, amount, householdId },
  });
  revalidatePath("/dashboard/bills");
  revalidatePath("/dashboard/spending");
  revalidatePath("/dashboard");
}

export async function deleteIncomeSource(id: string) {
  await prisma.incomeSource.delete({ where: { id } });
  revalidatePath("/dashboard/bills");
  revalidatePath("/dashboard/spending");
  revalidatePath("/dashboard");
}

/* ---------- Combined summary ----------
   The household "spending budget" is monthly joint income minus fixed
   monthly bills. Discretionary spending entries are tracked against that. */

export async function getFinanceSummary() {
  const householdId = await getHouseholdId();
  const [bills, income] = await Promise.all([
    prisma.monthlyBill.findMany({ where: { householdId } }),
    prisma.incomeSource.findMany({ where: { householdId } }),
  ]);
  const totalBills = bills.reduce((s, b) => s + b.amount, 0);
  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  return {
    totalIncome,
    totalBills,
    disposable: Math.max(totalIncome - totalBills, 0),
  };
}
