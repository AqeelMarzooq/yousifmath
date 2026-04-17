"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, BarChart2, Activity, ClipboardList, Settings, LogOut, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatWidget } from "@/components/chat/ChatWidget";

const links = [
  { href: "/parent/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/parent/progress", icon: BarChart2, label: "Progress" },
  { href: "/parent/activity", icon: Activity, label: "Activity" },
  { href: "/parent/assign", icon: ClipboardList, label: "Assign" },
  { href: "/parent/settings", icon: Settings, label: "Settings" },
];

export function ParentNav() {
  const pathname = usePathname();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-[#FFD700]/20">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/parent/dashboard" className="flex items-center gap-2">
            <Shield className="text-[#FFD700] w-5 h-5" />
            <span className="bebas text-xl tracking-widest text-white">Manager<span className="text-[#FFD700]">'s Office</span></span>
          </Link>
          <div className="flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all",
                  pathname.startsWith(l.href)
                    ? "bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30"
                    : "text-white/50 hover:text-white hover:bg-white/10"
                )}
              >
                <l.icon className="w-4 h-4" />
                <span className="hidden sm:block font-medium">{l.label}</span>
              </Link>
            ))}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-red-400 hover:bg-red-900/20 transition-all ml-2"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
      <div className="h-14" />
      <ChatWidget role="PARENT" />
    </>
  );
}
