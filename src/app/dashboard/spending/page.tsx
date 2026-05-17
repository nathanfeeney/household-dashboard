import { getSpendingEntries } from "@/app/actions/spending";
import SpendingTracker from "@/components/SpendingTracker";

export default async function SpendingPage() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const entries = await getSpendingEntries(month, year);

  return (
    <div style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "1rem" }}>Spending</h1>
      <SpendingTracker initialEntries={entries} initialMonth={month} initialYear={year} />
    </div>
  );
}