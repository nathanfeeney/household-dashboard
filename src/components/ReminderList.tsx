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
  if (days < 0) return <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "100px", background: "#FCEBEB", color: "#A32D2D" }}>Overdue</span>;
  if (days === 0) return <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "100px", background: "#FAEEDA", color: "#854F0B" }}>Today</span>;
  if (days <= 30) return <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "100px", background: "#FAEEDA", color: "#854F0B" }}>In {days} days</span>;
  return <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "100px", background: "#EAF3DE", color: "#3B6D11" }}>In {days} days</span>;
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

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "1rem", flexWrap: "wrap" }}>
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
          placeholder="Reminder name..."
          style={{ flex: 1, minWidth: "150px", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "15px" }}
        />
        <input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          style={{ padding: "8px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px" }}
        />
        <button
          onClick={handleAdd}
          disabled={loading}
          style={{ padding: "8px 16px", borderRadius: "8px", background: "#1D9E75", color: "#fff", border: "none", fontSize: "15px", cursor: "pointer" }}
        >
          {loading ? "..." : "Add"}
        </button>
      </div>

      {overdue.length > 0 && (
        <>
          <p style={{ fontSize: "12px", color: "#A32D2D", margin: "1rem 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Overdue</p>
          {overdue.map(reminder => (
            <div key={reminder.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "#fff", border: "1px solid #f7c1c1", borderRadius: "8px", marginBottom: "6px" }}>
              <span style={{ flex: 1, fontSize: "14px" }}>{reminder.label}</span>
              <span style={{ fontSize: "12px", color: "#6b7280" }}>{new Date(reminder.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
              <DueBadge days={daysUntil(reminder.dueDate)} />
              <button onClick={() => handleDelete(reminder.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "16px" }}>✕</button>
            </div>
          ))}
        </>
      )}

      {upcoming.length > 0 && (
        <>
          {overdue.length > 0 && <p style={{ fontSize: "12px", color: "#9ca3af", margin: "1rem 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Upcoming</p>}
          {upcoming.map(reminder => (
            <div key={reminder.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", marginBottom: "6px" }}>
              <span style={{ flex: 1, fontSize: "14px" }}>{reminder.label}</span>
              <span style={{ fontSize: "12px", color: "#6b7280" }}>{new Date(reminder.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
              <DueBadge days={daysUntil(reminder.dueDate)} />
              <button onClick={() => handleDelete(reminder.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "16px" }}>✕</button>
            </div>
          ))}
        </>
      )}

      {reminders.length === 0 && (
        <p style={{ textAlign: "center", marginTop: "2rem" }}>No reminders set</p>
      )}
    </div>
  );
}