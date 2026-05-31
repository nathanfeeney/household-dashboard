import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getHousehold } from "@/app/actions/household";
import { getSpendingEntries } from "@/app/actions/spending";
import { getSavingsPots } from "@/app/actions/savings";
import { getShoppingItems } from "@/app/actions/shopping";
import { getTodoItems } from "@/app/actions/todo";
import { getReminders } from "@/app/actions/reminders";
import WelcomeMessage from "@/components/WelcomeMessage";
import DateTime from "@/components/DateTime";
import { SpendWidget } from "@/components/dashboard/SpendWidget";
import { SavingsWidget } from "@/components/dashboard/SavingsWidget";
import { TasksWidget } from "@/components/dashboard/TasksWidget";
import { ShoppingWidget } from "@/components/dashboard/ShoppingWidget";

const MONTHLY_BUDGET = 2800;

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const household = await getHousehold();
  if (!household) redirect("/household");

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const monthLabel = now.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const [spendingEntries, savingsPots, shoppingItems, todoItems, reminders, members] =
    await Promise.all([
      getSpendingEntries(month, year),
      getSavingsPots(),
      getShoppingItems(),
      getTodoItems(),
      getReminders(),
      prisma.user.findMany({
        where: { householdId: household.id },
        select: { id: true, name: true, email: true },
      }),
    ]);

  const totalSpent = spendingEntries.reduce(
    (sum: number, e: { amount: number }) => sum + e.amount,
    0
  );

  const memberNames: Record<string, string> = {};
  members.forEach((m) => {
    memberNames[m.id] = m.name ?? m.email.split("@")[0];
  });

  const sortedShopping = [...shoppingItems].sort(
    (a: { createdAt: Date | string }, b: { createdAt: Date | string }) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const lastAdded = sortedShopping[0] as
    | { addedById?: string; createdAt: Date | string }
    | undefined;
  const lastAddedBy = lastAdded?.addedById
    ? (memberNames[lastAdded.addedById] ?? "Someone")
    : undefined;
  const lastAddedAt = lastAdded
    ? new Date(lastAdded.createdAt).toISOString()
    : undefined;

  const normalisedTasks = todoItems.map((t: {
    id: string;
    label: string;
    done: boolean;
    assignedTo: string | null;
    createdAt: Date | string;
  }) => ({
    id: t.id,
    title: t.label,
    due_date: null,
    assigned_to: t.assignedTo,
    is_complete: t.done,
  }));

  const normalisedReminders = reminders.map((r: {
    id: string;
    label: string;
    dueDate: Date | string;
  }) => ({
    id: r.id,
    title: r.label,
    remind_at: new Date(r.dueDate).toISOString(),
    is_dismissed: false,
  }));

  const normalisedShopping = shoppingItems.map((i: {
    id: string;
    label: string;
    category: string;
    done: boolean;
  }) => ({
    id: i.id,
    name: i.label,
    category: i.category,
    is_bought: i.done,
  }));

  const activeRemindersCount = normalisedReminders.filter(
    (r) => new Date(r.remind_at) > now
  ).length;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <WelcomeMessage />
        <DateTime />
      </div>

      <SpendWidget
        totalSpent={totalSpent}
        budget={MONTHLY_BUDGET}
        month={monthLabel}
      />

      <SavingsWidget pots={savingsPots} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <ShoppingWidget
          items={normalisedShopping}
          lastAddedBy={lastAddedBy}
          lastAddedAt={lastAddedAt}
        />

        <div className="card">
          <div className="widget-label">Reminders</div>
          {activeRemindersCount === 0 ? (
            <div className="reminders-mini__empty">None upcoming</div>
          ) : (
            <>
              <div className="reminders-mini__count">{activeRemindersCount}</div>
              <div className="reminders-mini__sub">upcoming</div>
            </>
          )}
        </div>
      </div>

      <TasksWidget
        tasks={normalisedTasks}
        reminders={normalisedReminders}
        memberNames={memberNames}
        currentUserId={session.user.id}
      />
    </div>
  );
}
