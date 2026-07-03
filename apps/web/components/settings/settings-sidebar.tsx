"use client";

import { Link } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { User, Settings, ShieldAlert, LayoutDashboard, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  name: string;
  href: string;
  hash?: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navigationItems: SidebarItem[] = [
  {
    name: "Profile",
    href: "/settings",
    hash: "#profile",
    icon: User,
    description: "Manage your personal details and email",
  },
  {
    name: "Preferences",
    href: "/settings",
    hash: "#preferences",
    icon: Settings,
    description: "Change language settings and notifications",
  },
  {
    name: "Security",
    href: "/settings",
    hash: "#sessions",
    icon: ShieldAlert,
    description: "Track active sessions and manage danger zone",
  },
];

const adminNavigationItems = [
  {
    name: "Admin Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    description: "High-level metrics and usage statistics",
  },
  {
    name: "Audit Logs",
    href: "/admin/audit",
    icon: ClipboardList,
    description: "Trace chronological LLM usage logs",
  },
];

export function SettingsSidebar() {
  const [activeHash, setActiveHash] = useState("#profile");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set initial active section from hash or default to profile
    if (window.location.hash) {
      setActiveHash(window.location.hash);
    }

    const handleHashChange = () => {
      setActiveHash(window.location.hash || "#profile");
    };

    window.addEventListener("hashchange", handleHashChange);

    // Fetch user profile to check if user is admin
    fetch("/api/users/me")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((user) => {
        if (user && user.role === "admin") {
          setIsAdmin(true);
        }
      })
      .catch((err) => console.error("Error fetching user in settings sidebar:", err));

    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <nav
      aria-label="Settings navigation"
      className="w-full md:w-64 shrink-0"
    >
      {/* Mobile Horizontal Tabs Navigation */}
      <div className="flex md:hidden border-b border-border overflow-x-auto scrollbar-none -mx-4 px-4 gap-2 mb-6">
        {navigationItems.map((item) => {
          const isActive = activeHash === item.hash;
          const Icon = item.icon;

          return (
            <Link
              key={item.hash}
              href={`${item.href}${item.hash}`}
              onClick={() => setActiveHash(item.hash || "")}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors outline-none focus-visible:bg-muted",
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
        {isAdmin &&
          adminNavigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap border-transparent text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:bg-muted"
              >
                <Icon className="size-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
      </div>

      {/* Desktop Vertical Sidebar Navigation */}
      <div className="hidden md:flex flex-col gap-1 w-full">
        {navigationItems.map((item) => {
          const isActive = activeHash === item.hash;
          const Icon = item.icon;

          return (
            <Link
              key={item.hash}
              href={`${item.href}${item.hash}`}
              onClick={() => setActiveHash(item.hash || "")}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "bg-secondary text-secondary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "size-5 transition-transform duration-200 group-hover:scale-105",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <div className="flex flex-col text-left">
                <span className="font-semibold text-foreground">{item.name}</span>
                <span className="text-[11px] font-normal text-muted-foreground group-hover:text-foreground/80 line-clamp-1">
                  {item.description}
                </span>
              </div>
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="h-px bg-border my-2" />
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-1 mb-1 text-left select-none">
              Administration
            </div>
            {adminNavigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon className="size-5 transition-transform duration-200 group-hover:scale-105 text-muted-foreground group-hover:text-foreground" />
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-foreground">{item.name}</span>
                    <span className="text-[11px] font-normal text-muted-foreground group-hover:text-foreground/80 line-clamp-1">
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </>
        )}
      </div>
    </nav>
  );
}
