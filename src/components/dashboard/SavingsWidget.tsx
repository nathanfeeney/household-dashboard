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
  const emptyState = (
    <div className="card">
      <div className="widget-label">Savings pots</div>
      <div style={{ fontSize: "13px", color: "var(--clr-ink-3)", textAlign: "center", padding: "12px 0" }}>
        No pots yet —{" "}
        <Link className="card card--interactive" href="/dashboard/savings" style={{ color: "var(--clr-ink)", textDecoration: "underline" }}>
          create one
        </Link>
      </div>
    </div>
  );

  if (pots.length === 0) return emptyState;

  const totalSaved  = pots.reduce((s, p) => s + p.currentAmount, 0);
  const totalTarget = pots.reduce((s, p) => s + p.targetAmount,  0);
  const displayPots = pots.slice(0, 3);

  return (
    <Link href="/dashboard/savings" className="card card--interactive">
      <div className="widget-label-row">
        <span className="widget-label" style={{ marginBottom: 0 }}>Savings pots</span>
        <span style={{ fontSize: "12px", color: "var(--clr-ink-3)", fontFamily: "var(--font-mono)" }}>
          £{totalSaved.toLocaleString("en-GB")} / £{totalTarget.toLocaleString("en-GB")}
        </span>
      </div>

      <div className="savings-pot-row">
        {displayPots.map((pot) => {
          const pct = Math.min((pot.currentAmount / pot.targetAmount) * 100, 100);
          return (
            <div key={pot.id}>
              <div className="savings-pot-item__header">
                <span className="savings-pot-item__name">
                  <span>{pot.emoji}</span>
                  <span>{pot.name}</span>
                </span>
                <span className="savings-pot-item__pct">{Math.round(pct)}%</span>
              </div>
              <div className="progress-track" style={{ height: "4px" }}>
                <div
                  className="progress-fill"
                  style={{ width: `${pct}%`, background: BAR_COLORS[pot.color] }}
                />
              </div>
            </div>
          );
        })}
        {pots.length > 3 && (
          <div style={{ fontSize: "12px", color: "var(--clr-ink-4)", textAlign: "center" }}>
            +{pots.length - 3} more pot{pots.length - 3 !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </Link>
  );
}
