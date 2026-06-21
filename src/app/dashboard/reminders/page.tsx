import { getReminders, getReminderGroups } from "@/app/actions/reminders";
import RemindersView from "@/components/RemindersView";

export default async function RemindersPage() {
  const [reminders, groups] = await Promise.all([getReminders(), getReminderGroups()]);
  return (
    <div className="sub-page">
      <h1 className="page-title" style={{ marginBottom: "1rem" }}>Reminders</h1>
      <RemindersView reminders={reminders} groups={groups} />
    </div>
  );
}
