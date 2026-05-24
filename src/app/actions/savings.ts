"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type SavingsPot = {
  id: string;
  householdId: string;
  createdById: string;
  name: string;
  emoji: string;
  targetAmount: number;
  currentAmount: number;
  color: "green" | "blue" | "amber" | "coral" | "purple";
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PotContribution = {
  id: string;
  potId: string;
  contributedById: string;
  amount: number;
  note: string | null;
  contributionDate: string;
  createdAt: string;
};

async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");
  return session;
}

async function getHouseholdId(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { householdId: true },
  });
  if (!user?.householdId) throw new Error("No household found");
  return user.householdId;
}

export async function getSavingsPots(): Promise<SavingsPot[]> {
  const session = await getSession();
  const householdId = await getHouseholdId(session.user.id);

  const pots = await prisma.savingsPot.findMany({
    where: { householdId, isArchived: false },
    orderBy: { createdAt: "asc" },
  });

  return pots.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
}

export async function createSavingsPot(formData: {
  name: string;
  emoji: string;
  target_amount: number;
  color: SavingsPot["color"];
}): Promise<void> {
  const session = await getSession();
  const householdId = await getHouseholdId(session.user.id);

  await prisma.savingsPot.create({
    data: {
      householdId,
      createdById: session.user.id,
      name: formData.name,
      emoji: formData.emoji,
      targetAmount: formData.target_amount,
      color: formData.color,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/savings");
}

export async function addContribution(formData: {
  pot_id: string;
  amount: number;
  note?: string;
}): Promise<void> {
  const session = await getSession();

  await prisma.$transaction([
    prisma.potContribution.create({
      data: {
        potId: formData.pot_id,
        contributedById: session.user.id,
        amount: formData.amount,
        note: formData.note ?? null,
      },
    }),
    prisma.savingsPot.update({
      where: { id: formData.pot_id },
      data: { currentAmount: { increment: formData.amount } },
    }),
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/savings");
}

export async function getPotContributions(potId: string): Promise<PotContribution[]> {
  await getSession();

  const contributions = await prisma.potContribution.findMany({
    where: { potId },
    orderBy: { contributionDate: "desc" },
    take: 20,
  });

  return contributions.map((c) => ({
    ...c,
    contributionDate: c.contributionDate.toISOString(),
    createdAt: c.createdAt.toISOString(),
  }));
}

export async function archiveSavingsPot(id: string): Promise<void> {
  await getSession();

  await prisma.savingsPot.update({
    where: { id },
    data: { isArchived: true },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/savings");
}

export async function updateSavingsPot(
  id: string,
  updates: Partial<Pick<SavingsPot, "name" | "emoji" | "targetAmount" | "color">>
): Promise<void> {
  await getSession();

  await prisma.savingsPot.update({
    where: { id },
    data: updates,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/savings");
}
