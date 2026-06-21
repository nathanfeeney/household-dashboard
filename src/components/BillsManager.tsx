"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addMonthlyBill,
  deleteMonthlyBill,
  addIncomeSource,
  deleteIncomeSource,
} from "@/app/actions/bills";

type Bill = { id: string; label: string; amount: number; dueDay: number | null };
type Income = { id: string; label: string; amount: number };

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "var(--clr-bg-alt)",
  border: "1px solid var(--clr-border)",
  borderRadius: "var(--r-sm)",
  fontSize: "14px",
  color: "var(--clr-ink)",
  fontFamily: "var(--font-body)",
  outline: "none",
  boxSizing: "border-box",
};

function fmt(n: number) {
  return `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function BillsManager({
  initialBills,
  initialIncome,
}: {
  initialBills: Bill[];
  initialIncome: Income[];
}) {
  const router = useRouter();
  const [bills, setBills] = useState(initialBills);
  const [income, setIncome] = useState(initialIncome);
  const [, startTransition] = useTransition();

  // Bill form
  const [billLabel, setBillLabel] = useState("");
  const [billAmount, setBillAmount] = useState("");
  const [billDay, setBillDay] = useState("");

  // Income form
  const [incLabel, setIncLabel] = useState("");
  const [incAmount, setIncAmount] = useState("");

  const totalBills = bills.reduce((s, b) => s + b.amount, 0);
  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const disposable = Math.max(totalIncome - totalBills, 0);

  function handleAddBill() {
    const amt = parseFloat(billAmount);
    if (!billLabel.trim() || isNaN(amt) || amt <= 0) return;
    const day = billDay ? parseInt(billDay, 10) : null;
    const optimistic: Bill = { id: crypto.randomUUID(), label: billLabel.trim(), amount: amt, dueDay: day };
    setBills((prev) => [...prev, optimistic]);
    setBillLabel("");
    setBillAmount("");
    setBillDay("");
    startTransition(async () => {
      await addMonthlyBill(optimistic.label, amt, day);
      router.refresh();
    });
  }

  function handleDeleteBill(id: string) {
    setBills((prev) => prev.filter((b) => b.id !== id));
    startTransition(async () => {
      await deleteMonthlyBill(id);
      router.refresh();
    });
  }

  function handleAddIncome() {
    const amt = parseFloat(incAmount);
    if (!incLabel.trim() || isNaN(amt) || amt <= 0) return;
    const optimistic: Income = { id: crypto.randomUUID(), label: incLabel.trim(), amount: amt };
    setIncome((prev) => [...prev, optimistic]);
    setIncLabel("");
    setIncAmount("");
    startTransition(async () => {
      await addIncomeSource(optimistic.label, amt);
      router.refresh();
    });
  }

  function handleDeleteIncome(id: string) {
    setIncome((prev) => prev.filter((i) => i.id !== id));
    startTransition(async () => {
      await deleteIncomeSource(id);
      router.refresh();
    });
  }

  const sectionLabel: React.CSSProperties = {
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    color: "var(--clr-ink-3)",
  };
  const addBtn: React.CSSProperties = {
    padding: "10px 16px",
    borderRadius: "var(--r-sm)",
    background: "var(--clr-ink)",
    color: "var(--clr-bg)",
    border: "none",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
  };

  function row(label: string, amount: number, sub: string | null, onDelete: () => void, key: string) {
    return (
      <div
        key={key}
        style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderBottom: "1px solid var(--clr-border-subtle)" }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "14px", color: "var(--clr-ink)", fontWeight: 500 }}>{label}</div>
          {sub && <div style={{ fontSize: "11px", color: "var(--clr-ink-3)", marginTop: "2px" }}>{sub}</div>}
        </div>
        <span style={{ fontSize: "14px", fontWeight: 600, fontFamily: "var(--font-mono)", color: "var(--clr-ink)" }}>{fmt(amount)}</span>
        <button
          onClick={onDelete}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--clr-ink-4)", fontSize: "16px", lineHeight: 1 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--clr-danger)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--clr-ink-4)")}
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {/* Summary */}
      <div className="card">
        <div className="widget-label">Monthly summary</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginTop: "8px" }}>
          <div>
            <div style={sectionLabel}>Joint income</div>
            <div style={{ fontSize: "18px", fontWeight: 500, color: "var(--clr-ink)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>{fmt(totalIncome)}</div>
          </div>
          <div>
            <div style={sectionLabel}>Outgoings</div>
            <div style={{ fontSize: "18px", fontWeight: 500, color: "var(--clr-danger)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>−{fmt(totalBills)}</div>
          </div>
          <div>
            <div style={sectionLabel}>Left to spend</div>
            <div style={{ fontSize: "18px", fontWeight: 500, color: "var(--clr-accent)", fontFamily: "var(--font-mono)", marginTop: "2px" }}>{fmt(disposable)}</div>
          </div>
        </div>
        <p style={{ fontSize: "11px", color: "var(--clr-ink-3)", marginTop: "12px", lineHeight: 1.5 }}>
          Your spending budget is joint income minus fixed bills. Day-to-day spending is tracked against the
          “left to spend” figure.
        </p>
      </div>

      {/* Income */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 16px 0" }}>
          <div className="widget-label">Joint income</div>
          <div style={{ display: "flex", gap: "8px", margin: "10px 0 14px", flexWrap: "wrap" }}>
            <input value={incLabel} onChange={(e) => setIncLabel(e.target.value)} placeholder="Source (e.g. Salary)" style={{ ...inputStyle, flex: 2, minWidth: "120px" }} />
            <input value={incAmount} onChange={(e) => setIncAmount(e.target.value)} type="number" min="0.01" step="0.01" placeholder="£ / month" style={{ ...inputStyle, flex: 1, minWidth: "90px" }} onKeyDown={(e) => e.key === "Enter" && handleAddIncome()} />
            <button onClick={handleAddIncome} style={addBtn}>Add</button>
          </div>
        </div>
        {income.length === 0 ? (
          <div style={{ padding: "0 16px 16px", fontSize: "13px", color: "var(--clr-ink-3)" }}>No income added yet.</div>
        ) : (
          income.map((i) => row(i.label, i.amount, null, () => handleDeleteIncome(i.id), i.id))
        )}
      </div>

      {/* Bills */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 16px 0" }}>
          <div className="widget-label">Monthly outgoings</div>
          <div style={{ display: "flex", gap: "8px", margin: "10px 0 14px", flexWrap: "wrap" }}>
            <input value={billLabel} onChange={(e) => setBillLabel(e.target.value)} placeholder="Outgoing (e.g. Netflix)" style={{ ...inputStyle, flex: 2, minWidth: "120px" }} />
            <input value={billAmount} onChange={(e) => setBillAmount(e.target.value)} type="number" min="0.01" step="0.01" placeholder="£ / month" style={{ ...inputStyle, flex: 1, minWidth: "90px" }} />
            <input value={billDay} onChange={(e) => setBillDay(e.target.value)} type="number" min="1" max="31" placeholder="Day" style={{ ...inputStyle, width: "70px" }} onKeyDown={(e) => e.key === "Enter" && handleAddBill()} />
            <button onClick={handleAddBill} style={addBtn}>Add</button>
          </div>
        </div>
        {bills.length === 0 ? (
          <div style={{ padding: "0 16px 16px", fontSize: "13px", color: "var(--clr-ink-3)" }}>No outgoings added yet.</div>
        ) : (
          bills.map((b) => row(b.label, b.amount, b.dueDay ? `Due on the ${b.dueDay}${ordinal(b.dueDay)}` : null, () => handleDeleteBill(b.id), b.id))
        )}
      </div>
    </div>
  );
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] ?? s[v] ?? s[0];
}
