import { getReminders } from "@/app/actions/reminders";
import ReminderList from "@/components/ReminderList";

export default async function RemindersPage() {
  const reminders = await getReminders();
  return (
    <div style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "1rem" }}>Reminders</h1>
      <ReminderList initialReminders={reminders} />
    </div>
  );
}