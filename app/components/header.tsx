"use client";

import { signOut } from "@/app/auth/actions";

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
        Steward
      </h1>
      <button
        onClick={() => signOut()}
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      >
        Log Out
      </button>
    </header>
  );
}