"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  LayoutDashboard,
  Leaf,
  LogOut,
  Search,
  TrendingUp,
  UserPlus,
  UserRound,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import { GOAL_LABELS } from "@/lib/nutrition";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/meal-plan", label: "Meal plan", icon: UtensilsCrossed },
  { href: "/food-search", label: "Food search", icon: Search },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/profile", label: "My profile", icon: UserRound },
] as const;

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const { profile, clearProfile, clearAll } = useApp();

  function handleLogout() {
    if (
      window.confirm(
        "Log out? You'll return to onboarding and can enter new data.",
      )
    ) {
      clearProfile();
      onCloseMobile();
    }
  }

  function handleNewProfile() {
    if (
      window.confirm(
        "Start a new profile? This clears your local profile, logs and meal plan.",
      )
    ) {
      clearAll();
      onCloseMobile();
    }
  }

  const initials = (profile?.name ?? "?")
    .split(" ")
    .map((p) => p.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border bg-card transition-all duration-300 lg:static lg:translate-x-0",
          collapsed ? "lg:w-[76px]" : "lg:w-64",
          "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 overflow-hidden"
            onClick={onCloseMobile}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
              <Leaf className="h-5 w-5" />
            </span>
            <span
              className={cn(
                "text-base font-bold transition-opacity",
                collapsed && "lg:hidden",
              )}
            >
              NutriAI
            </span>
          </Link>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1.5 text-muted hover:bg-background lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand text-white shadow-sm"
                    : "text-muted hover:bg-background hover:text-foreground",
                  collapsed && "lg:justify-center lg:px-0",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className={cn(collapsed && "lg:hidden")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl bg-background p-2.5",
              collapsed && "lg:justify-center lg:bg-transparent lg:p-0",
            )}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-dark">
              {initials || "?"}
            </span>
            <div className={cn("min-w-0", collapsed && "lg:hidden")}>
              <p className="truncate text-sm font-semibold">
                {profile?.name ?? "Guest"}
              </p>
              <p className="truncate text-xs text-muted">
                {profile ? GOAL_LABELS[profile.goal] : "Set up profile"}
              </p>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleNewProfile}
              title="New profile"
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl border border-border px-2 py-2 text-xs font-medium text-muted transition-colors hover:border-brand/40 hover:text-foreground",
                collapsed && "lg:col-span-2 lg:px-0",
              )}
            >
              <UserPlus className="h-3.5 w-3.5 shrink-0" />
              <span className={cn(collapsed && "lg:hidden")}>New</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              title="Log out"
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl border border-border px-2 py-2 text-xs font-medium text-muted transition-colors hover:border-danger/40 hover:text-danger",
                collapsed && "lg:col-span-2 lg:px-0",
              )}
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              <span className={cn(collapsed && "lg:hidden")}>Log out</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              "mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-muted transition-colors hover:bg-background hover:text-foreground",
              collapsed && "lg:justify-center lg:px-0",
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                collapsed && "rotate-180",
              )}
            />
            <span className={cn(collapsed && "lg:hidden")}>Collapse</span>
          </button>
        </div>
      </aside>
    </>
  );
}
