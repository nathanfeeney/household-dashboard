"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addSpendingEntry, deleteSpendingEntry, getSpendingEntries } from "@/app/actions/spending";

type Entry = {
  id: string;
  label: string;
  amount: number;
  category: string;
  date: Date;
  addedBy: { name: string | null; email: string };
};

const categories = ["food", "home", "car", "personal", "other"];

const catColors: Record<string, string> = {
  food: "#1D9E75",
  home: "#378ADD",
  car: "#BA7517",
  personal: "#D4537E",
  other: "#888780",
};

const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function SpendingTracker({ initialEntries, initialMonth, initialYear }: {
  initialEntries: Entry[];
  initialMonth: number;
  initialYear: number;
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAdd() {
    if (!label.trim() || !amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    await addSpendingEntry(label.trim(), parseFloat(amount), category, date);
    setLabel("");
    setAmount("");
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    setEntries(entries.filter(e => e.id !== id));
    await deleteSpendingEntry(id);
  }

  async function changeMonth(dir: number) {
    let newMonth = month + dir;
    let newYear = year;
    if (newMonth > 11) { newMonth = 0; newYear++; }
    if (newMonth < 0) { newMonth = 11; newYear--; }
    setMonth(newMonth);
    setYear(newYear);
    const newEntries = await getSpendingEntries(newMonth, newYear);
    setEntries(newEntries);
  }

  const total = entries.reduce((a, b) => a + b.amount, 0);
  const byCategory = categories.map(cat => ({
    cat,
    total: entries.filter(e => e.category === cat).reduce((a, b) => a + b.amount, 0),
  })).filter(c => c.total > 0);

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "1rem", flexWrap: "wrap" }}>
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="Description..."
          style={{ flex: 1, minWidth: "120px", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "15px" }}
        />
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="£0.00"
          min="0"
          step="0.01"
          style={{ width: "90px", padding: "8px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px" }}
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={{ padding: "8px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px" }}
        >
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ padding: "8px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px" }}
        />
        <button
          onClick={handleAdd}
          disabled={loading}
          style={{ padding: "8px 16px", borderRadius: "8px", background: "#1D9E75", color: "#fff", border: "none", fontSize: "15px", cursor: "pointer" }}
        >
          {loading ? "..." : "Add"}
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <button onClick={() => changeMonth(-1)} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "4px 12px", cursor: "pointer", fontSize: "18px" }}>‹</button>
        <span style={{ fontWeight: 500, fontSize: "15px" }}>{monthNames[month]} {year}</span>
        <button onClick={() => changeMonth(1)} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "4px 12px", cursor: "pointer", fontSize: "18px" }}>›</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "1rem" }}>
        <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "12px" }}>
          <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Total spent</p>
          <p style={{ fontSize: "22px", fontWeight: 500 }}>£{total.toFixed(2)}</p>
        </div>
        <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "12px" }}>
          <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>Transactions</p>
          <p style={{ fontSize: "22px", fontWeight: 500 }}>{entries.length}</p>
        </div>
      </div>

      {byCategory.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          {byCategory.sort((a, b) => b.total - a.total).map(({ cat, total: catTotal }) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: catColors[cat], flexShrink: 0 }} />
              <span style={{ fontSize: "13px", width: "70px", color: "#374151" }}>{cat}</span>
              <div style={{ flex: 1, background: "#e5e7eb", borderRadius: "4px", height: "6px" }}>
                <div style={{ width: `${(catTotal / total) * 100}%`, height: "6px", borderRadius: "4px", background: catColors[cat] }} />
              </div>
              <span style={{ fontSize: "13px", fontWeight: 500, minWidth: "60px", textAlign: "right" }}>£{catTotal.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 ? (
        <p style={{ textAlign: "center", color: "#9ca3af", marginTop: "2rem" }}>No spending this month</p>
      ) : (
        entries.map(entry => (
          <div key={entry.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", marginBottom: "6px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: catColors[entry.category], flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: "14px" }}>{entry.label}</span>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>{new Date(entry.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
            <span style={{ fontWeight: 500, fontSize: "15px" }}>£{entry.amount.toFixed(2)}</span>
            <button onClick={() => handleDelete(entry.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "16px" }}>✕</button>
          </div>
        ))
      )}
    </div>
  );
}