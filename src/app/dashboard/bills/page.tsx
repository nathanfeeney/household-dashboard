import { getMonthlyBills, getIncomeSources } from "@/app/actions/bills";
import BillsManager from "@/components/BillsManager";

export default async function BillsPage() {
  const [bills, income] = await Promise.all([getMonthlyBills(), getIncomeSources()]);
  return (
    <div className="sub-page">
      <h1 className="page-title" style={{ marginBottom: "1rem" }}>Bills &amp; Income</h1>
      <BillsManager initialBills={bills} initialIncome={income} />
    </div>
  );
}
