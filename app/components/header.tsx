"use client";

import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { MenuIcon } from "@/app/dashboard/components/icons";
import { useSidebar } from "./sidebar-provider";

export function Header() {
  const { setOpen } = useSidebar();

  return (
    <header className="flex items-center justify-between border-b border-ink-200 bg-paper-card px-6 py-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md p-2 text-ink-700 transition hover:bg-ink-100"
          aria-label="Open menu"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        <Link
          href="/dashboard"
          className="font-display text-xl font-bold text-ink-900 transition hover:text-ledger-700"
        >
          Steward
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => signOut()}
          className="px-4 py-2 text-sm font-medium text-ink-600 hover:text-ink-900"
        >
          Log Out
        </button>
      </div>
    </header>
  );
}
