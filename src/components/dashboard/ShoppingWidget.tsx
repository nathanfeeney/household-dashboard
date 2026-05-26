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
  lastAddedBy?: string; // display name
  lastAddedAt?: string; // ISO string
};

export function ShoppingWidget({ items, lastAddedBy, lastAddedAt }: ShoppingWidgetProps) {
  const remaining = items.filter((i) => !i.is_bought);
  const bought = items.filter((i) => i.is_bought).length;

  function formatRelative(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.round(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.round(diff / 3600000);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.round(diff / 86400000)}d ago`;
  }

  return (
    <Link href="/dashboard/shopping" style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "#fff",
          border: "0.5px solid #E5E5E5",
          borderRadius: "16px",
          padding: "18px",
          cursor: "pointer",
          transition: "border-color 0.15s",
          height: "100%",
          boxSizing: "border-box",
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
            fontSize: "11px",
            fontWeight: 500,
            color: "#5c5c5c",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: "10px",
          }}
        >
          Shopping list
        </div>

        {remaining.length === 0 && bought === 0 ? (
          <div style={{ fontSize: "13px", color: "#999" }}>Nothing added yet</div>
        ) : (
          <>
            <div style={{ fontSize: "24px", fontWeight: 500, color: "#1a1a1a" }}>
              {remaining.length}
            </div>
            <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>
              item{remaining.length !== 1 ? "s" : ""} remaining
              {bought > 0 && ` · ${bought} bought`}
            </div>

            {/* Preview up to 3 items */}
            {remaining.length > 0 && (
              <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
                {remaining.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    style={{
                      fontSize: "12px",
                      color: "#555",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    · {item.name}
                  </div>
                ))}
                {remaining.length > 3 && (
                  <div style={{ fontSize: "12px", color: "#bbb" }}>
                    +{remaining.length - 3} more
                  </div>
                )}
              </div>
            )}

            {lastAddedBy && lastAddedAt && (
              <div style={{ fontSize: "11px", color: "#bbb", marginTop: "10px" }}>
                Last by {lastAddedBy} · {formatRelative(lastAddedAt)}
              </div>
            )}
          </>
        )}
      </div>
    </Link>
  );
}
