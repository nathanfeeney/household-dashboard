"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addShoppingItem, toggleShoppingItem, deleteShoppingItem } from "@/app/actions/shopping";

type Item = {
  id: string;
  label: string;
  category: string;
  done: boolean;
};

const categories = ["food", "home", "personal", "other"];

export default function ShoppingList({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState("food");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAdd() {
    if (!label.trim()) return;
    setLoading(true);
    await addShoppingItem(label.trim(), category);
    setLabel("");
    setLoading(false);
    router.refresh();
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
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "1rem" }}>
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="Add item..."
          style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "15px" }}
        />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          style={{ padding: "8px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px" }}
        >
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button
          onClick={handleAdd}
          disabled={loading}
          style={{ padding: "8px 16px", borderRadius: "8px", background: "#1D9E75", color: "#fff", border: "none", fontSize: "15px", cursor: "pointer" }}
        >
          {loading ? "..." : "Add"}
        </button>
      </div>

      {active.map(item => (
        <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", marginBottom: "6px" }}>
          <input type="checkbox" checked={item.done} onChange={() => handleToggle(item.id, item.done)} />
          <span style={{ flex: 1, fontSize: "14px" }}>{item.label}</span>
          <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "100px", background: "#E1F5EE", color: "#0F6E56" }}>{item.category}</span>
          <button onClick={() => handleDelete(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "16px" }}>✕</button>
        </div>
      ))}

      {done.length > 0 && (
        <>
          <p style={{ fontSize: "12px", color: "#9ca3af", margin: "1rem 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Done ({done.length})</p>
          {done.map(item => (
            <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", marginBottom: "6px", opacity: 0.5 }}>
              <input type="checkbox" checked={item.done} onChange={() => handleToggle(item.id, item.done)} />
              <span style={{ flex: 1, fontSize: "14px", textDecoration: "line-through" }}>{item.label}</span>
              <button onClick={() => handleDelete(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "16px" }}>✕</button>
            </div>
          ))}
        </>
      )}

      {items.length === 0 && (
        <p style={{ textAlign: "center", color: "#9ca3af", marginTop: "2rem" }}>Your shopping list is empty</p>
      )}
    </div>
  );
}