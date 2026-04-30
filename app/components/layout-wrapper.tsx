"use client";

import { Header } from "./header";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthPage = pathname.startsWith("/auth") || pathname === "/";

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <>
      {!isAuthPage && <Header />}
      {children}
    </>
  );
}