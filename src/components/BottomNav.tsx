"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, WalletIcon, PiggyBankIcon, ListIcon, CheckSquareIcon } from "./Icons";

const NAV_ITEMS = [
  { href: "/dashboard",          label: "Home",    Icon: HomeIcon      },
  { href: "/dashboard/spending", label: "Finance", Icon: WalletIcon    },
  { href: "/dashboard/savings",  label: "Savings", Icon: PiggyBankIcon },
  { href: "/dashboard/shopping", label: "Lists",   Icon: ListIcon      },
  { href: "/dashboard/todo",     label: "Tasks",   Icon: CheckSquareIcon },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const isActive =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`bottom-nav__item${isActive ? " bottom-nav__item--active" : ""}` }
          >
            <Icon className="bottom-nav__icon" size={22} strokeWidth={isActive ? 2.1 : 1.65} />
            <span className="bottom-nav__label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
