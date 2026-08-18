"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarCheck,
  ListChecks,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/today", label: "Today", icon: CalendarCheck },
  { href: "/habits", label: "Habits", icon: ListChecks },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const activeIndex = NAV_ITEMS.findIndex(
    ({ href }) => pathname === href || pathname.startsWith(`${href}/`)
  );

  useEffect(() => {
    const updateIndicator = () => {
      const index = activeIndex >= 0 ? activeIndex : 0;
      const el = itemRefs.current[index];
      const list = listRef.current;
      if (!el || !list) return;
      const listRect = list.getBoundingClientRect();
      const itemRect = el.getBoundingClientRect();
      setIndicator({
        left: itemRect.left - listRect.left,
        width: itemRect.width,
      });
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeIndex, pathname]);

  return (
    <nav className="bottom-nav">
      <ul ref={listRef} className="bottom-nav-list">
        <span
          className="bottom-nav-indicator"
          style={{
            transform: `translateX(${indicator.left}px)`,
            width: indicator.width,
          }}
          aria-hidden
        />
        {NAV_ITEMS.map(({ href, label, icon: Icon }, index) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                href={href}
                prefetch
                className={cn(
                  "bottom-nav-item",
                  active && "bottom-nav-item-active"
                )}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px]",
                    active ? "stroke-[2.25]" : "stroke-[1.75]"
                  )}
                />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
