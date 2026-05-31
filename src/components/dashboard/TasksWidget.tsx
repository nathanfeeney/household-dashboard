"use client";

import Link from "next/link";
import { BellIcon } from "@/components/Icons";

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
  memberNames: Record<string, string>;
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
  const now = new Date();
  const upcoming = tasks
    .filter((t) => {
      if (t.is_complete) return false;
      if (!t.due_date) return true;
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
    <div className="card">
      <div className="widget-label-row">
        <span className="widget-label" style={{ marginBottom: 0 }}>Tasks</span>
        <Link href="/dashboard/todo" className="widget-link">View all →</Link>
      </div>

      {isEmpty ? (
        <div style={{ fontSize: "13px", color: "var(--clr-ink-3)", padding: "8px 0", textAlign: "center" }}>
          All caught up
        </div>
      ) : (
        <div>
          {upcoming.map((task) => {
            const { label, urgent } = formatDue(task.due_date);
            const assignedName =
              task.assigned_to === currentUserId
                ? "You"
                : memberNames[task.assigned_to ?? ""] ?? null;

            return (
              <div key={task.id} className="task-item">
                <div className="task-item__left">
                  <div className="task-item__circle" />
                  <span className="task-item__title">{task.title}</span>
                </div>
                <div className="task-item__meta">
                  {assignedName && <span className="task-item__assignee">{assignedName}</span>}
                  {label && (
                    <span className={`task-item__due${urgent ? " task-item__due--urgent" : ""}`}>
                      {label}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {upcomingReminders.map((r) => (
            <div key={r.id} className="reminder-item">
              <div className="reminder-item__left">
                <BellIcon className="reminder-item__icon" size={16} strokeWidth={1.75} />
                <span className="reminder-item__title">{r.title}</span>
              </div>
              <span className="reminder-item__date">
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
