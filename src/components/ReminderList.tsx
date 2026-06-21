"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addReminder,
  deleteReminder,
  addReminderGroup,
  deleteReminderGroup,
  moveReminderToGroup,
} from "@/app/actions/reminders";
import { groupColor, GROUP_COLOR_OPTIONS } from "@/lib/groupColors";

type Reminder = {
  id: string;
  label: string;
  dueDate: Date | string;
  groupId: string | null;
};

type Group = {
  id: string;
  name: string;
  color: string;
};

function daysUntil(date: Date | string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function DueBadge({ days }: { days: number }) {
  if (days < 0) return <span className="badge badge--danger">Overdue</span>;
  if (days === 0) return <span className="badge badge--warning">Today</span>;
  if (days <= 30) return <span className="badge badge--warning">In {days} days</span>;
  return <span className="badge badge--success">In {days} days</span>;
}

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

export default function ReminderList({
  initialReminders,
  initialGroups,
}: {
  initialReminders: Reminder[];
  initialGroups: Group[];
}) {
  const [reminders, setReminders] = useState(initialReminders);
  const [groups, setGroups] = useState(initialGroups);
  const [label, setLabel] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [newGroupId, setNewGroupId] = useState<string>("");
  const [filter, setFilter] = useState<string>("all"); // "all" | "none" | groupId
  const [loading, setLoading] = useState(false);

  // New-group form
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupColorChoice, setGroupColorChoice] = useState("slate");

  const router = useRouter();

  async function handleAdd() {
    if (!label.trim() || !dueDate) return;
    setLoading(true);
    await addReminder(label.trim(), dueDate, newGroupId || null);
    setLabel("");
    setDueDate("");
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    setReminders(reminders.filter((r) => r.id !== id));
    await deleteReminder(id);
  }

  async function handleCreateGroup() {
    if (!groupName.trim()) return;
    const g = await addReminderGroup(groupName.trim(), groupColorChoice);
    setGroups((prev) => [...prev, g]);
    setGroupName("");
    setGroupColorChoice("slate");
    setShowGroupForm(false);
    setNewGroupId(g.id);
  }

  async function handleDeleteGroup(id: string) {
    if (!confirm("Delete this group? Its reminders will be kept and moved to Ungrouped.")) return;
    setGroups((prev) => prev.filter((g) => g.id !== id));
    setReminders((prev) => prev.map((r) => (r.groupId === id ? { ...r, groupId: null } : r)));
    if (filter === id) setFilter("all");
    await deleteReminderGroup(id);
  }

  async function handleMove(id: string, groupId: string) {
    const gid = groupId || null;
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, groupId: gid } : r)));
    await moveReminderToGroup(id, gid);
  }

  const visible =
    filter === "all"
      ? reminders
      : filter === "none"
      ? reminders.filter((r) => !r.groupId)
      : reminders.filter((r) => r.groupId === filter);

  // Build section list: each group (in order) + an Ungrouped bucket. Only show
  // sections that have reminders within the current filter.
  const sections: { key: string; name: string; color: string; items: Reminder[] }[] = [];
  for (const g of groups) {
    const items = visible.filter((r) => r.groupId === g.id);
    if (items.length) sections.push({ key: g.id, name: g.name, color: g.color, items });
  }
  const ungrouped = visible.filter((r) => !r.groupId);
  if (ungrouped.length) sections.push({ key: "none", name: "Ungrouped", color: "slate", items: ungrouped });

  function ReminderRow({ r }: { r: Reminder }) {
    const days = daysUntil(r.dueDate);
    const overdue = days < 0;
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 12px",
          background: overdue ? "var(--clr-danger-bg)" : "var(--clr-surface)",
          border: `1px solid ${overdue ? "var(--clr-danger)" : "var(--clr-border)"}`,
          borderRadius: "var(--r-sm)",
          marginBottom: "6px",
          opacity: overdue ? 0.9 : 1,
        }}
      >
        <span style={{ flex: 1, fontSize: "14px", color: "var(--clr-ink)" }}>{r.label}</span>
        <span style={{ fontSize: "12px", color: "var(--clr-ink-3)", fontFamily: "var(--font-mono)" }}>
          {new Date(r.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </span>
        <DueBadge days={days} />
        <select
          value={r.groupId ?? ""}
          onChange={(e) => handleMove(r.id, e.target.value)}
          title="Move to group"
          style={{ ...inputStyle, padding: "4px 6px", fontSize: "12px" }}
        >
          <option value="">No group</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => handleDelete(r.id)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--clr-ink-4)", fontSize: "16px", lineHeight: 1, padding: "2px 4px", borderRadius: "4px" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--clr-danger)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--clr-ink-4)")}
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Add reminder */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Reminder name..."
          style={{ ...inputStyle, flex: 1, minWidth: "150px" }}
        />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
        <select value={newGroupId} onChange={(e) => setNewGroupId(e.target.value)} style={inputStyle}>
          <option value="">No group</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
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

      {/* Filter chips */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "16px", alignItems: "center" }}>
        {[{ id: "all", name: "All", color: "slate" }, ...groups, { id: "none", name: "Ungrouped", color: "slate" }].map(
          (g) => {
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
                {g.id !== "all" && g.id !== "none" && (
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.bar }} />
                )}
                {g.name}
              </button>
            );
          }
        )}
        <button
          onClick={() => setShowGroupForm((s) => !s)}
          style={{
            padding: "5px 12px",
            borderRadius: "var(--r-full)",
            border: "1px dashed var(--clr-border)",
            background: "transparent",
            color: "var(--clr-ink-3)",
            fontSize: "13px",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
        >
          + New group
        </button>
      </div>

      {/* New group form */}
      {showGroupForm && (
        <div className="card" style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
            placeholder="Group name (e.g. Bills, Birthdays)"
            style={inputStyle}
          />
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {GROUP_COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => setGroupColorChoice(c)}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: groupColor(c).bar,
                  border: groupColorChoice === c ? "3px solid var(--clr-ink)" : "3px solid transparent",
                  cursor: "pointer",
                  boxSizing: "border-box",
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleCreateGroup}
              style={{ flex: 1, padding: "10px", borderRadius: "var(--r-sm)", background: "var(--clr-ink)", color: "var(--clr-bg)", border: "none", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-body)" }}
            >
              Create group
            </button>
            <button
              onClick={() => setShowGroupForm(false)}
              style={{ padding: "10px 16px", borderRadius: "var(--r-sm)", background: "transparent", color: "var(--clr-ink-3)", border: "1px solid var(--clr-border)", fontSize: "14px", cursor: "pointer", fontFamily: "var(--font-body)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sections */}
      {sections.map((section) => {
        const c = groupColor(section.color);
        const isGroup = section.key !== "none";
        return (
          <div key={section.key} style={{ marginBottom: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "0 0 8px" }}>
              {isGroup && <span style={{ width: 10, height: 10, borderRadius: "50%", background: c.bar }} />}
              <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.6px", color: "var(--clr-ink-2)", textTransform: "uppercase" }}>
                {section.name} ({section.items.length})
              </span>
              {isGroup && (
                <button
                  onClick={() => handleDeleteGroup(section.key)}
                  title="Delete group"
                  style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--clr-ink-4)", fontSize: "13px", fontFamily: "var(--font-body)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--clr-danger)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--clr-ink-4)")}
                >
                  Delete group
                </button>
              )}
            </div>
            {[...section.items]
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .map((r) => (
                <ReminderRow key={r.id} r={r} />
              ))}
          </div>
        );
      })}

      {visible.length === 0 && (
        <p style={{ textAlign: "center", color: "var(--clr-ink-3)", marginTop: "2rem", fontSize: "14px" }}>
          No reminders here
        </p>
      )}
    </div>
  );
}
