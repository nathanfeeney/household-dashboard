"use client";

import Link from "next/link";

type ShoppingItem = {
  id: string;
  name: string;
  category: string | null;
  is_bought: boolean;
};

type ShoppingWidgetProps = {
  items: ShoppingItem[];
  lastAddedBy?: string;
  lastAddedAt?: string;
};

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(diff / 3600000);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(diff / 86400000)}d ago`;
}

export function ShoppingWidget({ items, lastAddedBy, lastAddedAt }: ShoppingWidgetProps) {
  const remaining = items.filter((i) => !i.is_bought);
  const bought = items.filter((i) => i.is_bought).length;

  return (
    <Link href="/dashboard/shopping" className="card card--interactive" style={{ height: "100%", boxSizing: "border-box" }}>
      <div className="widget-label">Shopping list</div>

      {remaining.length === 0 && bought === 0 ? (
        <div style={{ fontSize: "13px", color: "var(--clr-ink-3)" }}>Nothing added yet</div>
      ) : (
        <>
          <div className="shopping-count">{remaining.length}</div>
          <div className="shopping-sub">
            item{remaining.length !== 1 ? "s" : ""} remaining
            {bought > 0 && ` · ${bought} bought`}
          </div>

          {remaining.length > 0 && (
            <div className="shopping-preview">
              {remaining.slice(0, 3).map((item) => (
                <div key={item.id} className="shopping-preview__item">
                  {item.name}
                </div>
              ))}
              {remaining.length > 3 && (
                <div className="shopping-preview__more">+{remaining.length - 3} more</div>
              )}
            </div>
          )}

          {lastAddedBy && lastAddedAt && (
            <div className="shopping-last-added">
              Last by {lastAddedBy} · {formatRelative(lastAddedAt)}
            </div>
          )}
        </>
      )}
    </Link>
  );
}
