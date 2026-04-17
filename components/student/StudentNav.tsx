"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, BookOpen, Trophy, User, LogOut, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatWidget } from "@/components/chat/ChatWidget";

const links = [
  { href: "/student/dashboard", icon: LayoutDashboard, label: "Pitch" },
  { href: "/student/topics", icon: BookOpen, label: "Training" },
  { href: "/student/badges", icon: Trophy, label: "Trophies" },
  { href: "/student/profile", icon: User, label: "Profile" },
];

export function StudentNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/student/dashboard" className="flex items-center gap-2">
            <Zap className="text-[#FFD700] w-5 h-5" />
            <span className="bebas text-xl tracking-widest text-white">Yousif<span className="text-[#CC0000]">Math</span></span>
          </Link>
          <div className="flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all",
                  pathname.startsWith(l.href)
                    ? "bg-[#CC0000]/20 text-[#CC0000] border border-[#CC0000]/30"
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
      <ChatWidget role="STUDENT" />
    </>
  );
}
