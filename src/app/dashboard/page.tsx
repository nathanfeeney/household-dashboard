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

  // Fetch all data in parallel
  const [spendingEntries, savingsPots, shoppingItems, todoItems, reminders, members] =
    await Promise.all([
      getSpendingEntries(month, year),
      getSavingsPots(),
      getShoppingItems(),
      getTodoItems(),
      getReminders(),
      // Fetch all household members for name lookups
      prisma.user.findMany({
        where: { householdId: household.id },
        select: { id: true, name: true, email: true },
      }),
    ]);

  // Sum all spending entries (your SpendingEntry has no income/expense type — all are expenses)
  const totalSpent = spendingEntries.reduce(
    (sum: number, e: { amount: number }) => sum + e.amount,
    0
  );

  // userId -> display name (fall back to email prefix if no name set)
  const memberNames: Record<string, string> = {};
  members.forEach((m) => {
    memberNames[m.id] = m.name ?? m.email.split("@")[0];
  });

  // Most recently added shopping item for the widget subtitle
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

  // Normalise todo items for TasksWidget (schema uses `label` not `title`, `done` not `is_complete`)
  const normalisedTasks = todoItems.map((t: {
    id: string;
    label: string;
    done: boolean;
    assignedTo: string | null;
    createdAt: Date | string;
  }) => ({
    id: t.id,
    title: t.label,
    due_date: null, // TodoItem has no due date field yet
    assigned_to: t.assignedTo,
    is_complete: t.done,
  }));

  // Normalise reminders (schema uses `label` + `dueDate`, widget expects `title` + `remind_at`)
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

  // Normalise shopping items (schema uses `label` + `done`, widget expects `name` + `is_bought`)
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
    <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div>
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

        <div
          style={{
            background: "#fff",
            border: "0.5px solid #E5E5E5",
            borderRadius: "16px",
            padding: "18px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 500,
              color: "#999",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: "10px",
            }}
          >
            Reminders
          </div>
          {activeRemindersCount === 0 ? (
            <div style={{ fontSize: "13px", color: "#999" }}>None upcoming</div>
          ) : (
            <>
              <div style={{ fontSize: "24px", fontWeight: 500, color: "#1a1a1a" }}>
                {activeRemindersCount}
              </div>
              <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>upcoming</div>
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
