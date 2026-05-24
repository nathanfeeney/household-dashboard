"use client";

import Link from "next/link";
import type { SavingsPot } from "@/app/actions/savings";

const BAR_COLORS: Record<SavingsPot["color"], string> = {
  green: "#1D9E75",
  blue: "#378ADD",
  amber: "#EF9F27",
  coral: "#D85A30",
  purple: "#7F77DD",
};

type SavingsWidgetProps = {
  pots: SavingsPot[];
};

export function SavingsWidget({ pots }: SavingsWidgetProps) {
  if (pots.length === 0) {
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
          Savings pots
        </div>
        <div style={{ fontSize: "13px", color: "#999", textAlign: "center", padding: "12px 0" }}>
          No pots yet —{" "}
          <Link href="/dashboard/savings" style={{ color: "#1a1a1a", textDecoration: "underline" }}>
            create one
          </Link>
        </div>
      </div>
    );
  }

  const totalSaved = pots.reduce((s, p) => s + p.current_amount, 0);
  const totalTarget = pots.reduce((s, p) => s + p.target_amount, 0);

  // Show max 3 pots in widget
  const displayPots = pots.slice(0, 3);

  return (
    <Link href="/dashboard/savings" style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "#fff",
          border: "0.5px solid #E5E5E5",
          borderRadius: "16px",
          padding: "18px",
          cursor: "pointer",
          transition: "border-color 0.15s",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLDivElement).style.borderColor = "#CCC")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLDivElement).style.borderColor = "#E5E5E5")
        }
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 500,
              color: "#999",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Savings pots
          </div>
          <div style={{ fontSize: "12px", color: "#999" }}>
            £{totalSaved.toLocaleString("en-GB", { minimumFractionDigits: 0 })} /{" "}
            £{totalTarget.toLocaleString("en-GB", { minimumFractionDigits: 0 })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {displayPots.map((pot) => {
            const pct = Math.min((pot.currentAmount / pot.target_amount) * 100, 100);
            return (
              <div key={pot.id}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "5px",
                  }}
                >
                  <div style={{ fontSize: "13px", color: "#1a1a1a", display: "flex", gap: "6px" }}>
                    <span>{pot.emoji}</span>
                    <span>{pot.name}</span>
                  </div>
                  <span style={{ fontSize: "12px", color: "#999" }}>
                    {Math.round(pct)}%
                  </span>
                </div>
                <div
                  style={{
                    height: "4px",
                    background: "#F0F0F0",
                    borderRadius: "99px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: BAR_COLORS[pot.color],
                      borderRadius: "99px",
                    }}
                  />
                </div>
              </div>
            );
          })}
          {pots.length > 3 && (
            <div style={{ fontSize: "12px", color: "#999", textAlign: "center" }}>
              +{pots.length - 3} more pot{pots.length - 3 !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
