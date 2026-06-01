"use client";

import { useState } from "react";
import { addShoppingItem, toggleShoppingItem, deleteShoppingItem } from "@/app/actions/shopping";

type Item = {
  id: string;
  label: string;
  category: string;
  done: boolean;
};

const categories = ["food", "home", "personal", "other"];

// Category badge colours using the site's existing palette
const categoryColors: Record<string, { bg: string; text: string }> = {
  food:     { bg: "var(--clr-accent-light)", text: "var(--clr-accent)" },
  home:     { bg: "#E6F1FB", text: "#0C447C" },
  personal: { bg: "#F8E6F0", text: "#7B1A65" },
  other:    { bg: "var(--clr-bg-alt)", text: "var(--clr-ink-2)" },
};

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: "var(--r-sm)",
  border: "1px solid var(--clr-border)",
  fontSize: "14px",
  background: "var(--clr-bg-alt)",
  color: "var(--clr-ink)",
  fontFamily: "var(--font-body)",
  outline: "none",
};

export default function ShoppingList({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState("food");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!label.trim()) return;
    setLoading(true);
    const newItem = await addShoppingItem(label.trim(), category) as Item | undefined;
    if (newItem) {
      setItems(prev => [...prev, newItem]);
    }
    setLabel("");
    setLoading(false);
  }

  async function handleToggle(id: string, done: boolean) {
    setItems(items.map(i => i.id === id ? { ...i, done: !done } : i));
    await toggleShoppingItem(id, !done);
  }

  async function handleDelete(id: string) {
    setItems(items.filter(i => i.id !== id));
    await deleteShoppingItem(id);
  }

  const active = items.filter(i => !i.done);
  const done = items.filter(i => i.done);

  return (
    <div className="card">
      <div style={{ display: "flex", gap: "8px", marginBottom: "1rem", flex-wrap:"wrap" }}>
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="Add item..."
          style={{ ...inputStyle, flex: 1 }}
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={inputStyle}
        >
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          onClick={handleAdd}
          disabled={loading}
          style={{
            padding: "10px 16px",
            borderRadius: "var(--r-sm)",
            background: "var(--clr-ink)",
            color: "var(--clr-bg)",
            border: "none",
            fontSize: "14px",
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            fontFamily: "var(--font-body)",
          }}
        >
          {loading ? "…" : "Add"}
        </button>
      </div>

      {active.map(item => (
        <div
          key={item.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 12px",
            background: "var(--clr-surface)",
            border: "1px solid var(--clr-border)",
            borderRadius: "var(--r-sm)",
            marginBottom: "6px",
          }}
        >
          <input type="checkbox" checked={item.done} onChange={() => handleToggle(item.id, item.done)} />
          <span style={{ flex: 1, fontSize: "14px", color: "var(--clr-ink)" }}>{item.label}</span>
          <span
            style={{
              fontSize: "11px",
              padding: "2px 8px",
              borderRadius: "var(--r-full)",
              background: categoryColors[item.category]?.bg ?? "var(--clr-bg-alt)",
              color: categoryColors[item.category]?.text ?? "var(--clr-ink-2)",
              fontWeight: 500,
            }}
          >
            {item.category}
          </span>
          <button
            onClick={() => handleDelete(item.id)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--clr-ink-4)", fontSize: "16px", lineHeight: 1, padding: "2px 4px", borderRadius: "4px", transition: "color var(--dur) var(--ease)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--clr-danger)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--clr-ink-4)")}
          >×</button>
        </div>
      ))}

      {done.length > 0 && (
        <>
          <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.8px", color: "var(--clr-ink-3)", margin: "1rem 0 8px", textTransform: "uppercase" }}>
            Done ({done.length})
          </p>
          {done.map(item => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                background: "var(--clr-surface)",
                border: "1px solid var(--clr-border-subtle)",
                borderRadius: "var(--r-sm)",
                marginBottom: "6px",
                opacity: 0.5,
              }}
            >
              <input type="checkbox" checked={item.done} onChange={() => handleToggle(item.id, item.done)} />
              <span style={{ flex: 1, fontSize: "14px", color: "var(--clr-ink)", textDecoration: "line-through" }}>{item.label}</span>
              <button
                onClick={() => handleDelete(item.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--clr-ink-4)", fontSize: "16px" }}
              >×</button>
            </div>
          ))}
        </>
      )}

      {items.length === 0 && (
        <p style={{ textAlign: "center", color: "var(--clr-ink-3)", marginTop: "2rem", fontSize: "14px" }}>
          Your shopping list is empty
        </p>
      )}
    </div>
  );
}
