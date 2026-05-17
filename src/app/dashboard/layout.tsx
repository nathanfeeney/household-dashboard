import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import BottomNav from "../../components/BottomNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", minHeight: "100vh", paddingBottom: "70px" }}>
      {children}
      <BottomNav />
    </div>
  );
}