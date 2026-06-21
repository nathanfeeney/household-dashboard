"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addReminder, deleteReminder } from "@/app/actions/reminders";
import { groupColor } from "@/lib/groupColors";

type Reminder = {
  id: string;
  label: string;
  dueDate: Date | string;
  groupId: string | null;
};

type Group = { id: string; name: string; color: string };

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
  width: "100%",
  boxSizing: "border-box",
};

export default function ReminderCalendar({
  initialReminders,
  groups,
}: {
  initialReminders: Reminder[];
  groups: Group[];
}) {
  const router = useRouter();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Add form state (for the selected day)
  const [label, setLabel] = useState("");
  const [groupId, setGroupId] = useState("");
  const [loading, setLoading] = useState(false);

  const byDate = useMemo(() => {
    const map: Record<string, Reminder[]> = {};
    for (const r of initialReminders) {
      const key = ymd(new Date(r.dueDate));
      (map[key] ||= []).push(r);
    }
    return map;
  }, [initialReminders]);

  // Build the grid (Monday-first)
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7; // convert Sun=0 to Mon=0
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewYear, viewMonth, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = new Date(viewYear, viewMonth).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const todayKey = ymd(today);

  function go(delta: number) {
    const m = viewMonth + delta;
    const ny = viewYear + Math.floor(m / 12);
    const nm = ((m % 12) + 12) % 12;
    setViewYear(ny);
    setViewMonth(nm);
    setSelectedDate(null);
  }

  async function handleAdd() {
    if (!label.trim() || !selectedDate) return;
    setLoading(true);
    await addReminder(label.trim(), selectedDate, groupId || null);
    setLabel("");
    setGroupId("");
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deleteReminder(id);
    router.refresh();
  }

  const selectedItems = selectedDate ? byDate[selectedDate] ?? [] : [];

  return (
    <div>
      {/* Month nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <button onClick={() => go(-1)} style={navBtn}>‹</button>
        <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--clr-ink)" }}>{monthLabel}</div>
        <button onClick={() => go(1)} style={navBtn}>›</button>
      </div>

      {/* Weekday header */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "4px" }}>
        {WEEKDAYS.map((w) => (
          <div key={w} style={{ textAlign: "center", fontSize: "10px", fontWeight: 600, letterSpacing: "0.5px", color: "var(--clr-ink-3)", textTransform: "uppercase" }}>
            {w}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
        {cells.map((date, i) => {
          if (!date) return <div key={`e${i}`} />;
          const key = ymd(date);
          const items = byDate[key] ?? [];
          const isToday = key === todayKey;
          const isSelected = key === selectedDate;
          return (
            <button
              key={key}
              onClick={() => setSelectedDate(isSelected ? null : key)}
              style={{
                aspectRatio: "1 / 1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "3px",
                padding: "4px 2px",
                borderRadius: "var(--r-sm)",
                border: isSelected ? "2px solid var(--clr-ink)" : "1px solid var(--clr-border-subtle)",
                background: isToday ? "var(--clr-accent-light)" : "var(--clr-surface)",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                position: "relative",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: isToday ? 700 : 500, color: "var(--clr-ink)", fontFamily: "var(--font-mono)" }}>
                {date.getDate()}
              </span>
              <div style={{ display: "flex", gap: "2px", flexWrap: "wrap", justifyContent: "center" }}>
                {items.slice(0, 4).map((r) => {
                  const g = groups.find((x) => x.id === r.groupId);
                  return (
                    <span
                      key={r.id}
                      style={{ width: 5, height: 5, borderRadius: "50%", background: groupColor(g?.color ?? "slate").bar }}
                    />
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected day panel */}
      {selectedDate && (
        <div className="card" style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--clr-ink)" }}>
            {new Date(selectedDate).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </div>

          {selectedItems.map((r) => {
            const g = groups.find((x) => x.id === r.groupId);
            return (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", background: "var(--clr-bg-alt)", borderRadius: "var(--r-sm)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: groupColor(g?.color ?? "slate").bar }} />
                <span style={{ flex: 1, fontSize: "14px", color: "var(--clr-ink)" }}>{r.label}</span>
                {g && <span style={{ fontSize: "11px", color: "var(--clr-ink-3)" }}>{g.name}</span>}
                <button
                  onClick={() => handleDelete(r.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--clr-ink-4)", fontSize: "16px", lineHeight: 1 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--clr-danger)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--clr-ink-4)")}
                >
                  ×
                </button>
              </div>
            );
          })}

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Add a reminder on this day..."
              style={{ ...inputStyle, flex: 1, width: "auto", minWidth: "140px" }}
            />
            <select value={groupId} onChange={(e) => setGroupId(e.target.value)} style={{ ...inputStyle, width: "auto" }}>
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
              style={{ padding: "10px 16px", borderRadius: "var(--r-sm)", background: "var(--clr-ink)", color: "var(--clr-bg)", border: "none", fontSize: "14px", fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, fontFamily: "var(--font-body)" }}
            >
              {loading ? "…" : "Add"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const navBtn: React.CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: "var(--r-sm)",
  border: "1px solid var(--clr-border)",
  background: "var(--clr-surface)",
  color: "var(--clr-ink)",
  fontSize: "18px",
  cursor: "pointer",
  fontFamily: "var(--font-body)",
};
