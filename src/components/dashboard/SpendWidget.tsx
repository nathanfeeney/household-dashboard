"use client";

import { useMemo } from "react";

type SpendWidgetProps = {
  totalSpent: number;
  budget: number;
  month: string;
};

export function SpendWidget({ totalSpent, budget, month }: SpendWidgetProps) {
  const pct = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
  const remaining = Math.max(budget - totalSpent, 0);

  const { fillColor, badgeClass, label } = useMemo(() => {
    if (pct >= 90) return { fillColor: "var(--clr-danger)",  badgeClass: "badge badge--danger",  label: "Over budget"    };
    if (pct >= 70) return { fillColor: "var(--clr-warning)", badgeClass: "badge badge--warning", label: "Watch spending" };
    return         { fillColor: "var(--clr-accent)",         badgeClass: "badge badge--success", label: "On track"       };
  }, [pct]);

  const daysLeft =
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() -
    new Date().getDate();

  return (
    <div className="card">
      <div className="widget-label">{month} spending</div>

      <div className="spend-widget__amounts">
        <div>
          <div className="spend-widget__total">
            £{totalSpent.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
          </div>
          <div className="spend-widget__sub">
            of £{budget.toLocaleString("en-GB", { minimumFractionDigits: 2 })} budget
          </div>
        </div>
        <div className="spend-widget__right">
          <span className={badgeClass}>{label}</span>
          <div className="spend-widget__remaining">
            £{remaining.toLocaleString("en-GB", { minimumFractionDigits: 2 })} left · {daysLeft}d
          </div>
        </div>
      </div>

      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${pct}%`, background: fillColor }}
        />
      </div>
    </div>
  );
}
