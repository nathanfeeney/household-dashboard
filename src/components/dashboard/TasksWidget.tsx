"use client";

import Link from "next/link";

type Task = {
  id: string;
  title: string;
  due_date: string | null;
  assigned_to: string | null;
  is_complete: boolean;
};

type Reminder = {
  id: string;
  title: string;
  remind_at: string;
  is_dismissed: boolean;
};

type TasksWidgetProps = {
  tasks: Task[];
  reminders: Reminder[];
  memberNames: Record<string, string>; // user_id -> display_name
  currentUserId: string;
};

function formatDue(dateStr: string | null): { label: string; urgent: boolean } {
  if (!dateStr) return { label: "", urgent: false };
  const due = new Date(dateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - now.getTime()) / 86400000);
  if (diff < 0) return { label: "Overdue", urgent: true };
  if (diff === 0) return { label: "Today", urgent: true };
  if (diff === 1) return { label: "Tomorrow", urgent: false };
  if (diff <= 7) return { label: `${diff}d`, urgent: false };
  return { label: due.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), urgent: false };
}

export function TasksWidget({ tasks, reminders, memberNames, currentUserId }: TasksWidgetProps) {
  // Filter: incomplete tasks due within 7 days or overdue, max 4 items
  const now = new Date();
  const upcoming = tasks
    .filter((t) => {
      if (t.is_complete) return false;
      if (!t.due_date) return true; // No due date — still show (up to limit)
      const diff = Math.round(
        (new Date(t.due_date).setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)) / 86400000
      );
      return diff <= 7;
    })
    .slice(0, 4);

  const upcomingReminders = reminders
    .filter((r) => !r.is_dismissed && new Date(r.remind_at) > new Date())
    .slice(0, 2);

  const isEmpty = upcoming.length === 0 && upcomingReminders.length === 0;

  return (
    <div
      style={{
        background: "#fff",
        border: "0.5px solid #E5E5E5",
        borderRadius: "16px",
        padding: "18px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: 500,
            color: "#999",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Tasks
        </div>
        <Link
          href="/dashboard/todo"
          style={{ fontSize: "12px", color: "#888", textDecoration: "none" }}
        >
          View all →
        </Link>
      </div>

      {isEmpty ? (
        <div style={{ fontSize: "13px", color: "#999", padding: "8px 0", textAlign: "center" }}>
          All caught up ✓
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {upcoming.map((task, i) => {
            const { label, urgent } = formatDue(task.due_date);
            const assignedName =
              task.assigned_to === currentUserId
                ? "You"
                : memberNames[task.assigned_to ?? ""] ?? null;

            return (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "9px 0",
                  borderBottom:
                    i < upcoming.length - 1 ? "0.5px solid #F0F0F0" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      border: "1.5px solid #DDD",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      color: "#1a1a1a",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {task.title}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexShrink: 0,
                    marginLeft: "8px",
                  }}
                >
                  {assignedName && (
                    <span style={{ fontSize: "11px", color: "#999" }}>{assignedName}</span>
                  )}
                  {label && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                        color: urgent ? "#E24B4A" : "#888",
                      }}
                    >
                      {label}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Upcoming reminders */}
          {upcomingReminders.map((r) => (
            <div
              key={r.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "9px 0",
                borderTop: "0.5px solid #F0F0F0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "13px" }}>🔔</span>
                <span style={{ fontSize: "13px", color: "#1a1a1a" }}>{r.title}</span>
              </div>
              <span style={{ fontSize: "11px", color: "#888" }}>
                {new Date(r.remind_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
