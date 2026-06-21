"use client";

import { useState } from "react";
import {
  addShoppingItem,
  toggleShoppingItem,
  deleteShoppingItem,
  clearShoppingList,
  addShoppingGroup,
  deleteShoppingGroup,
  moveShoppingItemToGroup,
} from "@/app/actions/shopping";
import { groupColor, GROUP_COLOR_OPTIONS } from "@/lib/groupColors";

type Item = {
  id: string;
  label: string;
  category: string;
  done: boolean;
  groupId: string | null;
};

type Group = { id: string; name: string; color: string };

const categories = ["tesco", "morrisons", "asda", "marks", "pets", "sainsbury", "any"];

const categoryColors: Record<string, { bg: string; text: string }> = {
  tesco: { bg: "#D6E4F5", text: "#00539F" },
  morrisons: { bg: "#FFF8D6", text: "#005828" },
  asda: { bg: "#E8F5D6", text: "#4A7C0F" },
  marks: { bg: "#D6EDE6", text: "#00593E" },
  pets: { bg: "#EFE0F8", text: "#5A1E7A" },
  sainsbury: { bg: "#FFF0D6", text: "#E85D00" },
  any: { bg: "#ffe2feee", text: "#440042" },
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

export default function ShoppingList({
  initialItems,
  initialGroups,
}: {
  initialItems: Item[];
  initialGroups: Group[];
}) {
  const [items, setItems] = useState(initialItems);
  const [groups, setGroups] = useState(initialGroups);
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState("any");
  const [newGroupId, setNewGroupId] = useState("");
  const [filter, setFilter] = useState("all"); // "all" | "none" | groupId
  const [loading, setLoading] = useState(false);

  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupColorChoice, setGroupColorChoice] = useState("slate");

  async function handleAdd() {
    if (!label.trim()) return;
    setLoading(true);
    const newItem = (await addShoppingItem(label.trim(), category, newGroupId || null)) as Item | undefined;
    if (newItem) setItems((prev) => [...prev, newItem]);
    setLabel("");
    setLoading(false);
  }

  async function handleToggle(id: string, done: boolean) {
    setItems(items.map((i) => (i.id === id ? { ...i, done: !done } : i)));
    await toggleShoppingItem(id, !done);
  }

  async function handleDelete(id: string) {
    setItems(items.filter((i) => i.id !== id));
    await deleteShoppingItem(id);
  }

  async function handleClear() {
    // Clear within current filter only when a specific group/none is active.
    const target = filter === "all" ? undefined : filter === "none" ? null : filter;
    setItems((prev) => (target === undefined ? [] : prev.filter((i) => (i.groupId ?? null) !== (target || null))));
    await clearShoppingList(target);
  }

  async function handleMove(id: string, groupId: string) {
    const gid = groupId || null;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, groupId: gid } : i)));
    await moveShoppingItemToGroup(id, gid);
  }

  async function handleCreateGroup() {
    if (!groupName.trim()) return;
    const g = await addShoppingGroup(groupName.trim(), groupColorChoice);
    setGroups((prev) => [...prev, g]);
    setGroupName("");
    setGroupColorChoice("slate");
    setShowGroupForm(false);
    setNewGroupId(g.id);
  }

  async function handleDeleteGroup(id: string) {
    if (!confirm("Delete this list? Its items will be kept and moved to Ungrouped.")) return;
    setGroups((prev) => prev.filter((g) => g.id !== id));
    setItems((prev) => prev.map((i) => (i.groupId === id ? { ...i, groupId: null } : i)));
    if (filter === id) setFilter("all");
    await deleteShoppingGroup(id);
  }

  const visible =
    filter === "all" ? items : filter === "none" ? items.filter((i) => !i.groupId) : items.filter((i) => i.groupId === filter);

  // Sections: each group + Ungrouped
  const sections: { key: string; name: string; color: string; items: Item[] }[] = [];
  for (const g of groups) {
    const its = visible.filter((i) => i.groupId === g.id);
    if (its.length) sections.push({ key: g.id, name: g.name, color: g.color, items: its });
  }
  const ungrouped = visible.filter((i) => !i.groupId);
  if (ungrouped.length) sections.push({ key: "none", name: "Ungrouped", color: "slate", items: ungrouped });

  function Row({ item }: { item: Item }) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 12px",
          background: "var(--clr-surface)",
          border: `1px solid ${item.done ? "var(--clr-border-subtle)" : "var(--clr-border)"}`,
          borderRadius: "var(--r-sm)",
          marginBottom: "6px",
          opacity: item.done ? 0.5 : 1,
        }}
      >
        <input type="checkbox" checked={item.done} onChange={() => handleToggle(item.id, item.done)} />
        <span style={{ flex: 1, fontSize: "14px", color: "var(--clr-ink)", textDecoration: item.done ? "line-through" : "none" }}>
          {item.label}
        </span>
        <span
          style={{
            fontSize: "13px",
            padding: "2px 8px",
            borderRadius: "var(--r-full)",
            background: categoryColors[item.category]?.bg ?? "var(--clr-bg-alt)",
            color: categoryColors[item.category]?.text ?? "var(--clr-ink-2)",
            fontWeight: 600,
          }}
        >
          {item.category}
        </span>
        <select
          value={item.groupId ?? ""}
          onChange={(e) => handleMove(item.id, e.target.value)}
          title="Move to list"
          style={{ ...inputStyle, padding: "4px 6px", fontSize: "12px" }}
        >
          <option value="">No list</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => handleDelete(item.id)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--clr-ink-4)", fontSize: "16px", lineHeight: 1, padding: "2px 4px" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--clr-danger)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--clr-ink-4)")}
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Add item */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Add item..."
          style={{ ...inputStyle, flex: 1 }}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={newGroupId} onChange={(e) => setNewGroupId(e.target.value)} style={inputStyle}>
          <option value="">No list</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleAdd}
          disabled={loading}
          style={{ padding: "10px 16px", borderRadius: "var(--r-sm)", background: "var(--clr-ink)", color: "var(--clr-bg)", border: "none", fontSize: "14px", fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, fontFamily: "var(--font-body)" }}
        >
          {loading ? "…" : "Add"}
        </button>
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px", alignItems: "center" }}>
        {[{ id: "all", name: "All", color: "slate" }, ...groups, { id: "none", name: "Ungrouped", color: "slate" }].map((g) => {
          const active = filter === g.id;
          const c = groupColor(g.color);
          return (
            <button
              key={g.id}
              onClick={() => setFilter(g.id)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "5px 12px",
                borderRadius: "var(--r-full)",
                border: `1px solid ${active ? "var(--clr-ink)" : "var(--clr-border)"}`,
                background: active ? "var(--clr-ink)" : "transparent",
                color: active ? "var(--clr-bg)" : "var(--clr-ink-2)",
                fontSize: "13px",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              {g.id !== "all" && g.id !== "none" && <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.bar }} />}
              {g.name}
            </button>
          );
        })}
        <button
          onClick={() => setShowGroupForm((s) => !s)}
          style={{ padding: "5px 12px", borderRadius: "var(--r-full)", border: "1px dashed var(--clr-border)", background: "transparent", color: "var(--clr-ink-3)", fontSize: "13px", cursor: "pointer", fontFamily: "var(--font-body)" }}
        >
          + New list
        </button>
      </div>

      {/* New group form */}
      {showGroupForm && (
        <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "10px", padding: "12px", background: "var(--clr-bg-alt)", borderRadius: "var(--r-md)" }}>
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
            placeholder="List name (e.g. Weekly shop, DIY)"
            style={{ ...inputStyle, background: "var(--clr-surface)" }}
          />
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {GROUP_COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => setGroupColorChoice(c)}
                style={{ width: 26, height: 26, borderRadius: "50%", background: groupColor(c).bar, border: groupColorChoice === c ? "3px solid var(--clr-ink)" : "3px solid transparent", cursor: "pointer", boxSizing: "border-box" }}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={handleCreateGroup} style={{ flex: 1, padding: "10px", borderRadius: "var(--r-sm)", background: "var(--clr-ink)", color: "var(--clr-bg)", border: "none", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-body)" }}>
              Create list
            </button>
            <button onClick={() => setShowGroupForm(false)} style={{ padding: "10px 16px", borderRadius: "var(--r-sm)", background: "transparent", color: "var(--clr-ink-3)", border: "1px solid var(--clr-border)", fontSize: "14px", cursor: "pointer", fontFamily: "var(--font-body)" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sections */}
      {sections.map((section) => {
        const c = groupColor(section.color);
        const isGroup = section.key !== "none";
        const active = section.items.filter((i) => !i.done);
        const done = section.items.filter((i) => i.done);
        return (
          <div key={section.key} style={{ marginBottom: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "0 0 8px" }}>
              {isGroup && <span style={{ width: 10, height: 10, borderRadius: "50%", background: c.bar }} />}
              <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.6px", color: "var(--clr-ink-2)", textTransform: "uppercase" }}>
                {section.name} ({active.length})
              </span>
              {isGroup && (
                <button
                  onClick={() => handleDeleteGroup(section.key)}
                  style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--clr-ink-4)", fontSize: "13px", fontFamily: "var(--font-body)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--clr-danger)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--clr-ink-4)")}
                >
                  Delete list
                </button>
              )}
            </div>
            {active.map((item) => (
              <Row key={item.id} item={item} />
            ))}
            {done.map((item) => (
              <Row key={item.id} item={item} />
            ))}
          </div>
        );
      })}

      {/* Clear button */}
      {visible.some((i) => i.done) && (
        <button
          onClick={handleClear}
          style={{ padding: "6px 12px", borderRadius: "var(--r-sm)", background: "var(--clr-accent)", color: "var(--clr-bg)", border: "none", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-body)" }}
        >
          Clear {filter === "all" ? "list" : "this list"}
        </button>
      )}

      {visible.length === 0 && (
        <p style={{ textAlign: "center", color: "var(--clr-ink-3)", marginTop: "2rem", fontSize: "14px" }}>
          Nothing here yet
        </p>
      )}
    </div>
  );
}
