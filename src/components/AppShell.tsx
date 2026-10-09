"use client";

import { useState } from "react";
import { Leaf } from "lucide-react";
import { useApp } from "@/context/AppContext";
import OnboardingWizard from "@/components/OnboardingWizard";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Skeleton } from "@/components/ui";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isReady, profile, saveProfile } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isReady) {
    return <BootLoader />;
  }

  if (!profile) {
    return <OnboardingWizard onComplete={saveProfile} />;
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6">{children}</main>
        <footer className="border-t border-border px-4 py-4 sm:px-6">
          <p className="text-[11px] leading-relaxed text-muted">
            Demo interface: nutrition figures and recommendations are
            illustrative, not medical advice. Always consult a qualified
            healthcare professional before changing your diet.
          </p>
        </footer>
      </div>
    </div>
  );
}

function BootLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <div className="w-full max-w-md px-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white">
          <Leaf className="h-6 w-6 animate-pulse" />
        </div>
        <p className="text-sm font-semibold">Loading NutriAI…</p>
        <div className="mt-5 space-y-2">
          <Skeleton className="mx-auto h-3 w-3/4" />
          <Skeleton className="mx-auto h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}
