"use client";

import Link from "next/link";
import type { SavingsPot } from "@/app/actions/savings";

const BAR_COLORS: Record<SavingsPot["color"], string> = {
  green:  "var(--clr-accent)",
  blue:   "#378ADD",
  amber:  "var(--clr-warning)",
  coral:  "#D85A30",
  purple: "#7F77DD",
  teal:   "#2BB3B1",
  pink:   "#E46AA5",
  indigo: "#4B63D6",
  lime:   "#A3C644",
  slate:  "#64748B",
};

type SavingsWidgetProps = { pots: SavingsPot[] };

export function SavingsWidget({ pots }: SavingsWidgetProps) {
  if (pots.length === 0) {
    return (
      <div className="card">
        <div className="widget-label">Savings</div>
        <div style={{ fontSize: "13px", color: "var(--clr-ink-3)", textAlign: "center", padding: "12px 0" }}>
          No pots yet —{" "}
          <Link href="/dashboard/savings" style={{ color: "var(--clr-ink)", textDecoration: "underline" }}>
            add one
          </Link>
        </div>
      </div>
    );
  }

  const totalSaved = pots.reduce((s, p) => s + p.currentAmount, 0);
  const displayPots = pots.slice(0, 4);

  return (
    <Link href="/dashboard/savings" className="card card--interactive">
      <div className="widget-label-row">
        <span className="widget-label" style={{ marginBottom: 0 }}>Total in savings</span>
        <span style={{ fontSize: "16px", fontWeight: 500, color: "var(--clr-ink)", fontFamily: "var(--font-mono)" }}>
          £{totalSaved.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div className="savings-pot-row" style={{ marginTop: "8px" }}>
        {displayPots.map((pot) => (
          <div key={pot.id} className="savings-pot-item__header" style={{ paddingTop: "4px" }}>
            <span className="savings-pot-item__name">
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: BAR_COLORS[pot.color], display: "inline-block" }} />
              <span>{pot.emoji}</span>
              <span>{pot.name}</span>
            </span>
            <span style={{ fontSize: "13px", color: "var(--clr-ink-2)", fontFamily: "var(--font-mono)" }}>
              £{pot.currentAmount.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
        {pots.length > 4 && (
          <div style={{ fontSize: "12px", color: "var(--clr-ink-4)", textAlign: "center" }}>
            +{pots.length - 4} more pot{pots.length - 4 !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </Link>
  );
}
