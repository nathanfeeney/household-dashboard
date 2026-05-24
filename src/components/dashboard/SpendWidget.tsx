"use client";

import { useMemo } from "react";

type SpendWidgetProps = {
  totalSpent: number;
  budget: number;
  month: string; // e.g. "May 2025"
};

export function SpendWidget({ totalSpent, budget, month }: SpendWidgetProps) {
  const pct = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
  const remaining = Math.max(budget - totalSpent, 0);

  const { color, label } = useMemo(() => {
    if (pct >= 90) return { color: "#E24B4A", label: "Over budget" };
    if (pct >= 70) return { color: "#EF9F27", label: "Watch spending" };
    return { color: "#1D9E75", label: "On track" };
  }, [pct]);

  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();
  const today = new Date().getDate();
  const daysLeft = daysInMonth - today;

  return (
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
          marginBottom: "12px",
        }}
      >
        {month} spending
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "12px",
        }}
      >
        <div>
          <div style={{ fontSize: "28px", fontWeight: 500, color: "#1a1a1a", lineHeight: 1 }}>
            £{totalSpent.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: "12px", color: "#999", marginTop: "4px" }}>
            of £{budget.toLocaleString("en-GB", { minimumFractionDigits: 2 })} budget
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 500,
              padding: "4px 10px",
              borderRadius: "99px",
              background:
                pct >= 90 ? "#FCEBEB" : pct >= 70 ? "#FAEEDA" : "#E1F5EE",
              color,
            }}
          >
            {label}
          </span>
          <div style={{ fontSize: "12px", color: "#999", marginTop: "6px" }}>
            £{remaining.toLocaleString("en-GB", { minimumFractionDigits: 2 })} left · {daysLeft}d
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: "6px",
          background: "#F0F0F0",
          borderRadius: "99px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: "99px",
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}
