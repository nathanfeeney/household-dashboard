"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/dashboard/shopping", label: "Shopping", icon: "🛒" },
  { href: "/dashboard/todo", label: "To-do", icon: "✅" },
  { href: "/dashboard/reminders", label: "Reminders", icon: "🔔" },
  { href: "/dashboard/spending", label: "Spending", icon: "💷" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: "480px",
      borderTop: "1px solid #e5e7eb",
      background: "#fff",
      display: "flex",
      justifyContent: "space-around",
      padding: "8px 0",
      zIndex: 50,
    }}>
      {links.map(({ href, label, icon }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2px",
            fontSize: "11px",
            color: active ? "#1D9E75" : "#6b7280",
            textDecoration: "none",
            fontWeight: active ? 600 : 400,
          }}>
            <span style={{ fontSize: "20px" }}>{icon}</span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}