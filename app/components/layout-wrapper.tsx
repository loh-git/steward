"use client";

import { Header } from "./header";
import { usePathname } from "next/navigation";
import ConnectionListener from "./connection-listener";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAuthPage = pathname?.startsWith("/auth") || pathname === "/";

  return (
    <>
      {!isAuthPage && <Header />}
      {!isAuthPage && <ConnectionListener />}
      {children}
    </>
  );
}
