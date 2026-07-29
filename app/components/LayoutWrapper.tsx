"use client";

import { Header } from "./header";
import { usePathname } from "next/navigation";
import ConnectionListener from "./connection-listener";
import { SidebarProvider } from "./sidebar-provider";
import AppSidebar from "./app-sidebar";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAuthPage = pathname?.startsWith("/auth") || pathname === "/";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <Header />
      <ConnectionListener />
      {children}
    </SidebarProvider>
  );
}
