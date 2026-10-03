"use client";

import { Header } from "./header";
import { usePathname } from "next/navigation";
import ConnectionListener from "./connection-listener";
import { SidebarProvider } from "./sidebar-provider";
import AppSidebar from "./app-sidebar";
import { DemoBanner } from "./DemoBanner";

// The <main> landmark wraps page content in both layouts. It keeps the flex-column sizing the
// pages already relied on when they were direct children of <body>.
const MAIN_CLASSES = "flex flex-1 flex-col";

export function LayoutWrapper({
  children,
  isDemo,
}: {
  children: React.ReactNode;
  isDemo: boolean;
}) {
  const pathname = usePathname();

  const isAuthPage = pathname?.startsWith("/auth") || pathname === "/";

  if (isAuthPage) {
    return (
      <main id="main-content" className={MAIN_CLASSES}>
        {children}
      </main>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <Header isDemo={isDemo} />
      {isDemo && <DemoBanner />}
      <ConnectionListener />
      <main id="main-content" className={MAIN_CLASSES}>
        {children}
      </main>
    </SidebarProvider>
  );
}
