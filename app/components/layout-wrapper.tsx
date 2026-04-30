"use client";

import { Header } from "./header";
import { usePathname } from "next/navigation";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAuthPage = pathname?.startsWith("/auth") || pathname === "/";

  return (
    <>
      {!isAuthPage && <Header />}
      {children}
    </>
  );
}
