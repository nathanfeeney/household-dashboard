"use client";

import { useState, useTransition } from "react";
import { addSpendingEntry, deleteSpendingEntry } from "@/app/actions/spending";
import { PlusIcon, WalletIcon } from "@/components/Icons";

type SpendingEntry = {
  id: string;
  label: string;
  amount: number;
  category: string;
  date: Date | string;
  addedBy?: { name: string | null; email: string } | null;
};

type SpendingTrackerProps = {
  initialEntries: SpendingEntry[];
  initialMonth: number;
  initialYear: number;
};

const CATEGORIES = [
  "Groceries",
  "Eating out",
  "Transport",
  "Utilities",
  "Entertainment",
  "Health",
  "Shopping",
  "Other",
];

const CATEGORY_COLORS: Record<string, string> = {
  "Groceries":     "var(--clr-accent)",
  "Eating out":    "#E46AA5",
  "Transport":     "#378ADD",
  "Utilities":     "#64748B",
  "Entertainment": "#7F77DD",
  "Health":        "#2BB3B1",
  "Shopping":      "#EF9F27",
  "Other":         "#A3C644",
};

const MONTHLY_BUDGET = 2800;

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function formatAmount(n: number): string {
  return `£${n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function CategoryDot({ category }: { category: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: CATEGORY_COLORS[category] ?? "var(--clr-ink-4)",
        flexShrink: 0,
      }}
    />
  );
}

export default function SpendingTracker({
  initialEntries,
  initialMonth,
  initialYear,
}: SpendingTrackerProps) {
  const [entries, setEntries] = useState<SpendingEntry[]>(initialEntries);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formError, setFormError] = useState("");

  const totalSpent = entries.reduce((s, e) => s + e.amount, 0);
  const pct = Math.min((totalSpent / MONTHLY_BUDGET) * 100, 100);
  const remaining = Math.max(MONTHLY_BUDGET - totalSpent, 0);

  // Group by category for mini breakdown
  const byCategory = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount;
    return acc;
  }, {});
  const topCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  function handleAdd() {
    const parsed = parseFloat(amount);
    if (!label.trim()) { setFormError("Please enter a description."); return; }
    if (isNaN(parsed) || parsed <= 0) { setFormError("Please enter a valid amount."); return; }
    setFormError("");

    startTransition(async () => {
      await addSpendingEntry(label.trim(), parsed, category, date);
      // Optimistic update
      setEntries((prev) => [
        {
          id: crypto.randomUUID(),
          label: label.trim(),
          amount: parsed,
          category,
          date: new Date(date),
          addedBy: null,
        },
        ...prev,
      ]);
      setLabel("");
      setAmount("");
      setCategory(CATEGORIES[0]);
      setDate(new Date().toISOString().slice(0, 10));
      setShowForm(false);
    });
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      await deleteSpendingEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      setDeletingId(null);
    });
  }

  const progressColor =
    pct >= 90 ? "var(--clr-danger)" : pct >= 70 ? "var(--clr-warning)" : "var(--clr-accent)";
  const statusLabel =
    pct >= 90 ? "Over budget" : pct >= 70 ? "Watch spending" : "On track";
  const statusClass =
    pct >= 90 ? "badge badge--danger" : pct >= 70 ? "badge badge--warning" : "badge badge--success";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

      {/* Summary card */}
      <div className="card">
        <div className="widget-label-row">
          <span className="widget-label" style={{ marginBottom: 0 }}>
            {new Date(initialYear, initialMonth).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
          </span>
          <span className={statusClass}>{statusLabel}</span>
        </div>

        <div className="spend-widget__amounts">
          <div>
            <div className="spend-widget__total">{formatAmount(totalSpent)}</div>
            <div className="spend-widget__sub">of {formatAmount(MONTHLY_BUDGET)} budget</div>
          </div>
          <div className="spend-widget__right">
            <div style={{ fontSize: "13px", fontWeight: 500, color: "var(--clr-ink-2)" }}>
              {formatAmount(remaining)} left
            </div>
          </div>
        </div>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%`, background: progressColor }} />
        </div>

        {/* Category breakdown */}
        {topCategories.length > 0 && (
          <div
            style={{
              marginTop: "16px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
            }}
          >
            {topCategories.map(([cat, total]) => (
              <div
                key={cat}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 10px",
                  background: "var(--clr-bg-alt)",
                  borderRadius: "var(--r-sm)",
                }}
              >
                <CategoryDot category={cat} />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--clr-ink-3)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cat}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "var(--clr-ink)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {formatAmount(total)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add entry form */}
      {showForm ? (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div className="widget-label">New entry</div>

          <input
            type="text"
            placeholder="Description"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            style={inputStyle}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <input
              type="number"
              placeholder="Amount (£)"
              value={amount}
              min="0.01"
              step="0.01"
              onChange={(e) => setAmount(e.target.value)}
              style={inputStyle}
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={inputStyle}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {formError && (
            <div style={{ fontSize: "12px", color: "var(--clr-danger)" }}>{formError}</div>
          )}

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleAdd}
              disabled={isPending}
              style={{
                flex: 1,
                padding: "11px",
                background: "var(--clr-ink)",
                color: "var(--clr-bg)",
                border: "none",
                borderRadius: "var(--r-md)",
                fontSize: "14px",
                fontWeight: 500,
                cursor: isPending ? "not-allowed" : "pointer",
                opacity: isPending ? 0.6 : 1,
                fontFamily: "var(--font-body)",
              }}
            >
              {isPending ? "Saving…" : "Add entry"}
            </button>
            <button
              onClick={() => { setShowForm(false); setFormError(""); }}
              style={{
                padding: "11px 16px",
                background: "transparent",
                color: "var(--clr-ink-3)",
                border: "1px solid var(--clr-border)",
                borderRadius: "var(--r-md)",
                fontSize: "14px",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            padding: "12px",
            background: "var(--clr-surface)",
            border: "1px dashed var(--clr-border)",
            borderRadius: "var(--r-lg)",
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--clr-ink-3)",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            transition: "border-color var(--dur) var(--ease), color var(--dur) var(--ease)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--clr-accent)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--clr-accent)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--clr-border)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--clr-ink-3)";
          }}
        >
          <PlusIcon size={16} strokeWidth={2} />
          Add spending entry
        </button>
      )}

      {/* Entries list */}
      {entries.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "32px 20px",
            color: "var(--clr-ink-3)",
            fontSize: "14px",
          }}
        >
          <div style={{ margin: "0 auto 10px", display: "block", opacity: 0.4 }}>
            <WalletIcon size={28} strokeWidth={1.5} />
          </div>
          No entries this month yet.
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 18px",
                borderBottom: i < entries.length - 1 ? "1px solid var(--clr-border-subtle)" : "none",
                opacity: deletingId === entry.id ? 0.4 : 1,
                transition: "opacity 200ms",
              }}
            >
              <CategoryDot category={entry.category} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "14px",
                    color: "var(--clr-ink)",
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {entry.label}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--clr-ink-3)",
                    display: "flex",
                    gap: "6px",
                    alignItems: "center",
                    marginTop: "2px",
                  }}
                >
                  <span>{entry.category}</span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span>{formatDate(entry.date)}</span>
                  {entry.addedBy && (
                    <>
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span>{entry.addedBy.name ?? entry.addedBy.email.split("@")[0]}</span>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    fontFamily: "var(--font-mono)",
                    color: "var(--clr-ink)",
                  }}
                >
                  {formatAmount(entry.amount)}
                </span>
                <button
                  onClick={() => handleDelete(entry.id)}
                  disabled={!!deletingId}
                  title="Delete"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--clr-ink-4)",
                    padding: "4px",
                    lineHeight: 1,
                    fontSize: "16px",
                    borderRadius: "4px",
                    transition: "color var(--dur) var(--ease)",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.color = "var(--clr-danger)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLButtonElement).style.color = "var(--clr-ink-4)")
                  }
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
};
