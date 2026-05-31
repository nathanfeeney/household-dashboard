"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addReminder, deleteReminder } from "@/app/actions/reminders";

type Reminder = {
  id: string;
  label: string;
  dueDate: Date;
};

function daysUntil(date: Date) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function DueBadge({ days }: { days: number }) {
  if (days < 0) return (
    <span className="badge badge--danger">Overdue</span>
  );
  if (days === 0) return (
    <span className="badge badge--warning">Today</span>
  );
  if (days <= 30) return (
    <span className="badge badge--warning">In {days} days</span>
  );
  return (
    <span className="badge badge--success">In {days} days</span>
  );
}

export default function ReminderList({ initialReminders }: { initialReminders: Reminder[] }) {
  const [reminders, setReminders] = useState(initialReminders);
  const [label, setLabel] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleAdd() {
    if (!label.trim() || !dueDate) return;
    setLoading(true);
    await addReminder(label.trim(), dueDate);
    setLabel("");
    setDueDate("");
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    setReminders(reminders.filter(r => r.id !== id));
    await deleteReminder(id);
  }

  const upcoming = reminders.filter(r => daysUntil(r.dueDate) >= 0);
  const overdue = reminders.filter(r => daysUntil(r.dueDate) < 0);

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

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "1rem", flexWrap: "wrap" }}>
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="Reminder name..."
          style={{ ...inputStyle, flex: 1, minWidth: "150px" }}
        />
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          style={inputStyle}
        />
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

      {overdue.length > 0 && (
        <>
          <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.8px", color: "var(--clr-danger)", margin: "1rem 0 8px", textTransform: "uppercase" }}>
            Overdue
          </p>
          {overdue.map(reminder => (
            <div
              key={reminder.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                background: "var(--clr-danger-bg)",
                border: "1px solid var(--clr-danger)",
                borderRadius: "var(--r-sm)",
                marginBottom: "6px",
                opacity: 0.85,
              }}
            >
              <span style={{ flex: 1, fontSize: "14px", color: "var(--clr-ink)" }}>{reminder.label}</span>
              <span style={{ fontSize: "12px", color: "var(--clr-ink-3)", fontFamily: "var(--font-mono)" }}>
                {new Date(reminder.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
              <DueBadge days={daysUntil(reminder.dueDate)} />
              <button
                onClick={() => handleDelete(reminder.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--clr-ink-4)", fontSize: "16px", lineHeight: 1, padding: "2px 4px", borderRadius: "4px", transition: "color var(--dur) var(--ease)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--clr-danger)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--clr-ink-4)")}
              >×</button>
            </div>
          ))}
        </>
      )}

      {upcoming.length > 0 && (
        <>
          {overdue.length > 0 && (
            <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.8px", color: "var(--clr-ink-3)", margin: "1rem 0 8px", textTransform: "uppercase" }}>
              Upcoming
            </p>
          )}
          {upcoming.map(reminder => (
            <div
              key={reminder.id}
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
              <span style={{ flex: 1, fontSize: "14px", color: "var(--clr-ink)" }}>{reminder.label}</span>
              <span style={{ fontSize: "12px", color: "var(--clr-ink-3)", fontFamily: "var(--font-mono)" }}>
                {new Date(reminder.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
              <DueBadge days={daysUntil(reminder.dueDate)} />
              <button
                onClick={() => handleDelete(reminder.id)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--clr-ink-4)", fontSize: "16px", lineHeight: 1, padding: "2px 4px", borderRadius: "4px", transition: "color var(--dur) var(--ease)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--clr-danger)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--clr-ink-4)")}
              >×</button>
            </div>
          ))}
        </>
      )}

      {reminders.length === 0 && (
        <p style={{ textAlign: "center", color: "var(--clr-ink-3)", marginTop: "2rem", fontSize: "14px" }}>
          No reminders set
        </p>
      )}
    </div>
  );
}
