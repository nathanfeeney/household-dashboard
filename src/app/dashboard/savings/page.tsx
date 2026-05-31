import { getSavingsPots } from "@/app/actions/savings";
import SavingsPots from "@/components/SavingsPots";

export default async function SavingsPage() {
  const pots = await getSavingsPots();

  return (
    <div className="sub-page">
      <h1 className="page-title" style={{ marginBottom: "1rem" }}>
        Savings pots
      </h1>
      <SavingsPots initialPots={pots} />
    </div>
  );
}
