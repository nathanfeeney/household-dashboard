"use server";

import { prisma } from "../../lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function createHousehold(name: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");

  const household = await prisma.household.create({
    data: {
      name,
      members: { connect: { id: session.user.id } },
    },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { householdId: household.id },
  });

  redirect("/dashboard");
}

export async function joinHousehold(inviteCode: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");

  const household = await prisma.household.findUnique({ where: { inviteCode } });
  if (!household) throw new Error("Invalid invite code");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { householdId: household.id },
  });

  redirect("/dashboard");
}

export async function getHousehold() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { household: true },
  });
  return user?.household ?? null;
}