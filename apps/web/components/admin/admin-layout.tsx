"use client";

import { useEffect, useState } from "react";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { LayoutDashboard, ClipboardList, Settings, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navigationItems: SidebarItem[] = [
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
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Configure profile details and credentials",
  },
];

export function AdminLayout({
  children,
  title = "Admin Portal",
  description = "View audit logs, cohort metrics, and system activity.",
}: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkRole() {
      try {
        const res = await fetch("/api/users/me");
        if (res.status === 401) {
          if (active) {
            router.push("/auth/sign-in");
          }
          return;
        }

        const user = await res.json();
        if (user.role === "admin") {
          if (active) {
            setIsAdmin(true);
            setLoading(false);
          }
        } else {
          if (active) {
            setIsAdmin(false);
            router.push("/dashboard");
          }
        }
      } catch (err) {
        console.error("Auth check error in AdminLayout:", err);
        if (active) {
          setIsAdmin(false);
          router.push("/dashboard");
        }
      }
    }

    checkRole();

    return () => {
      active = false;
    };
  }, [router]);

  if (loading || isAdmin === false) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="size-8 animate-spin text-indigo-500" />
        <p className="text-sm text-slate-500 font-medium">Verifying administrator credentials...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 md:py-10">
      {/* Admin header */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
          {description}
        </p>
      </div>

      {/* Admin navigation and content layout */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 pt-4 border-t border-border">
        {/* Navigation Sidebar */}
        <nav aria-label="Admin navigation" className="w-full md:w-64 shrink-0">
          {/* Mobile Navigation Tabs */}
          <div className="flex md:hidden border-b border-border overflow-x-auto scrollbar-none -mx-4 px-4 gap-2 mb-6">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
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
          </div>

          {/* Desktop Navigation Sidebar */}
          <div className="hidden md:flex flex-col gap-1 w-full">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
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
          </div>
        </nav>

        {/* Content Pane */}
        <main className="flex-1 min-w-0">
          <div className="animate-in fade-in slide-in-from-bottom-1 duration-200">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
