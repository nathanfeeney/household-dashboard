import { getSpendingEntries } from "@/app/actions/spending";
import SpendingTracker from "@/components/SpendingTracker";

export default async function SpendingPage() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const entries = await getSpendingEntries(month, year);

  return (
    <div className="sub-page">
      <h1 className="page-title" style={{ marginBottom: "1rem" }}>Spending</h1>
      <SpendingTracker initialEntries={entries} initialMonth={month} initialYear={year} />
    </div>
  );
}