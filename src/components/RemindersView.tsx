"use client";

import { useState } from "react";
import ReminderList from "./ReminderList";
import ReminderCalendar from "./ReminderCalendar";

type Reminder = {
  id: string;
  label: string;
  dueDate: Date | string;
  groupId: string | null;
};

type Group = { id: string; name: string; color: string };

export default function RemindersView({
  reminders,
  groups,
}: {
  reminders: Reminder[];
  groups: Group[];
}) {
  const [tab, setTab] = useState<"list" | "calendar">("list");

  const tabBtn = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "9px",
    borderRadius: "var(--r-sm)",
    border: "none",
    background: active ? "var(--clr-surface)" : "transparent",
    color: active ? "var(--clr-ink)" : "var(--clr-ink-3)",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    boxShadow: active ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: "4px",
          padding: "4px",
          background: "var(--clr-bg-alt)",
          borderRadius: "var(--r-md)",
          marginBottom: "16px",
        }}
      >
        <button onClick={() => setTab("list")} style={tabBtn(tab === "list")}>
          List
        </button>
        <button onClick={() => setTab("calendar")} style={tabBtn(tab === "calendar")}>
          Calendar
        </button>
      </div>

      {tab === "list" ? (
        <ReminderList initialReminders={reminders} initialGroups={groups} />
      ) : (
        <ReminderCalendar initialReminders={reminders} groups={groups} />
      )}
    </div>
  );
}
