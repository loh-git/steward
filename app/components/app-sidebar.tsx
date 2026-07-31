"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartIcon,
  CloseIcon,
  GridViewIcon,
  PiggyBankIcon,
  ReceiptIcon,
  SettingsIcon,
} from "@/app/dashboard/components/icons";
import { useSidebar } from "./sidebar-provider";

export default function AppSidebar() {
  const { open, setOpen } = useSidebar();
  const pathname = usePathname();

  const close = () => setOpen(false);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-ink-900/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
        aria-hidden={!open}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-strongroom-500 bg-strongroom-900 shadow-xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-strongroom-500 px-5 py-4">
          <span className="font-display text-lg font-bold text-brass-300">Steward</span>
          <button
            type="button"
            onClick={close}
            className="rounded-md p-1.5 text-white/50 transition hover:bg-white/10 hover:text-ledger-300"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          <SidebarLink
            href="/dashboard"
            icon={<ChartIcon className="text-bottle-400" />}
            label="Dashboard"
            hint="Overview of your planner"
            active={pathname === "/dashboard" || pathname.startsWith("/dashboard")}
            onNavigate={close}
          />
          <SidebarLink
            href="/expenses"
            icon={<ReceiptIcon className="text-ledger-400" />}
            label="Expenses"
            hint="Recurring monthly outgoings"
            active={pathname === "/expenses"}
            onNavigate={close}
          />
          <SidebarLink
            href="/savings"
            icon={<PiggyBankIcon className="text-brass-400" />}
            label="Savings"
            hint="Monthly savings goals"
            active={pathname === "/savings"}
            onNavigate={close}
          />
          <SidebarLink
            href="/compare"
            icon={<GridViewIcon className="text-white/70" />}
            label="Compare"
            hint="Line items across the year"
            active={pathname === "/compare"}
            onNavigate={close}
          />
          <SidebarLink
            href="/settings"
            icon={<SettingsIcon className="text-white/50" />}
            label="Settings"
            hint="Edit user & financial information"
            active={pathname === "/settings"}
            onNavigate={close}
          />
        </nav>
      </aside>
    </>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  hint,
  active,
  onNavigate,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  hint: string;
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-start gap-3 rounded-md px-3 py-3 transition ${
        active
          ? "bg-strongroom-500 ring-1 ring-ledger-400/40"
          : "hover:bg-strongroom-500/60"
      }`}
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10">
        {icon}
      </span>
      <span>
        <span className="block font-medium text-white">{label}</span>
        <span className="block text-xs text-white/50">{hint}</span>
      </span>
    </Link>
  );
}
