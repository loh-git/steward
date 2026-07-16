"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartIcon,
  CloseIcon,
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
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
        aria-hidden={!open}
      />

      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-[#2a3560] bg-[#1e2a4a] shadow-xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-[#2a3560] px-5 py-4">
          <span className="text-lg font-bold text-emerald-400">Steward</span>
          <button
            type="button"
            onClick={close}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-emerald-300"
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          <SidebarLink
            href="/dashboard"
            icon={<ChartIcon className="text-emerald-400" />}
            label="Dashboard"
            hint="Overview of your planner"
            active={pathname === "/dashboard" || pathname.startsWith("/dashboard")}
            onNavigate={close}
          />
          <SidebarLink
            href="/expenses"
            icon={<ReceiptIcon className="text-rose-400" />}
            label="Expenses"
            hint="Recurring monthly outgoings"
            active={pathname === "/expenses"}
            onNavigate={close}
          />
          <SidebarLink
            href="/savings"
            icon={<PiggyBankIcon className="text-violet-400" />}
            label="Savings"
            hint="Monthly savings goals"
            active={pathname === "/savings"}
            onNavigate={close}
          />
          <SidebarLink
            href="/settings"
            icon={<SettingsIcon className="text-slate-300" />}
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
      className={`flex items-start gap-3 rounded-xl px-3 py-3 transition ${
        active
          ? "bg-[#2a3560] ring-1 ring-emerald-500/30"
          : "hover:bg-[#2a3560]/60"
      }`}
    >
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
        {icon}
      </span>
      <span>
        <span className="block font-medium text-emerald-300">{label}</span>
        <span className="block text-xs text-slate-400">{hint}</span>
      </span>
    </Link>
  );
}
