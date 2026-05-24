import { getSavingsPots } from "@/app/actions/savings";
import SavingsPots from "@/components/SavingsPots";

export default async function SavingsPage() {
  const pots = await getSavingsPots();

  return (
    <div style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "1rem" }}>
        Savings pots
      </h1>
      <SavingsPots initialPots={pots} />
    </div>
  );
}
