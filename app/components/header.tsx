"use client";

import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { MenuIcon } from "@/app/dashboard/components/icons";
import { useSidebar } from "./sidebar-provider";

export function Header() {
  const { setOpen } = useSidebar();

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-zinc-800"
          aria-label="Open menu"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        <Link
          href="/dashboard"
          className="text-xl font-bold text-gray-900 dark:text-white"
        >
          Steward
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => signOut()}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          Log Out
        </button>
      </div>
    </header>
  );
}
