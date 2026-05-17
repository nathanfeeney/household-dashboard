import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getHousehold } from "@/app/actions/household";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");

  const household = await getHousehold();
  if (!household) redirect("/household");

  return (
    <div style={{ padding: "1rem" }}>
      <h1 style={{ fontSize: "20px", fontWeight: 600 }}>Welcome, {session.user.name ?? session.user.email}</h1>
      <p style={{ color: "#6b7280", marginTop: "4px" }}>{household.name}</p>
    </div>
  );
}