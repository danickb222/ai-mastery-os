"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: "◉" },
  { href: "/curriculum", label: "Curriculum", icon: "◈" },
  { href: "/run", label: "Run", icon: "▶" },
  { href: "/mastery", label: "Mastery Map", icon: "◇" },
  { href: "/library", label: "Library", icon: "◆" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0a0a12] text-gray-100 flex flex-col">
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a12]/80 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              AI Mastery OS
            </span>
          </Link>
          <div className="flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors whitespace-nowrap ${
                    active
                      ? "bg-indigo-600/20 text-indigo-400"
                      : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                  }`}
                >
                  <span className="text-xs">{item.icon}</span>
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      <main className="flex-1">
  <div className="mx-auto w-full max-w-6xl px-4 py-6">
    {children}
  </div>
</main>

    </div>
  );
}
