import { getReminders } from "@/app/actions/reminders";
import ReminderList from "@/components/ReminderList";

export default async function RemindersPage() {
  const reminders = await getReminders();
  return (
    <div className="sub-page">
      <h1 className="page-title" style={{ marginBottom: "1rem" }}>Reminders</h1>
      <ReminderList initialReminders={reminders} />
    </div>
  );
}