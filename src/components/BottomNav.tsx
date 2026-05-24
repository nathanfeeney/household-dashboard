"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard",          label: "Home",     icon: "⌂"  },
  { href: "/dashboard/spending", label: "Money",    icon: "£"  },
  { href: "/dashboard/savings",  label: "Savings",  icon: "◎"  },
  { href: "/dashboard/shopping", label: "Lists",    icon: "☑"  },
  { href: "/dashboard/todo",     label: "Tasks",    icon: "✓"  },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "480px",
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderTop: "0.5px solid #E5E5E5",
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 0 max(14px, env(safe-area-inset-bottom))",
        zIndex: 40,
      }}
    >
      {NAV_ITEMS.map(({ href, label, icon }) => {
        const isActive =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "3px",
              textDecoration: "none",
              color: isActive ? "#1a1a1a" : "#AAA",
              minWidth: "52px",
              transition: "color 0.15s",
            }}
          >
            <span
              style={{
                fontSize: "20px",
                lineHeight: 1,
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {icon}
            </span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: isActive ? 500 : 400,
                letterSpacing: "0.2px",
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
