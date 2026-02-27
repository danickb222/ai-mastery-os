"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { ShellErrorBoundary } from "./ShellErrorBoundary";

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function TrainIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

function ArenaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function LabIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6v7l4 8H5l4-8V3z" />
      <path d="M9 3h6" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 1 0-16 0" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

const tabs = [
  { label: "Dashboard", href: "/", icon: <DashboardIcon /> },
  { label: "Train", href: "/curriculum", icon: <TrainIcon /> },
  { label: "Arena", href: "/arena", icon: <ArenaIcon /> },
  { label: "Lab", href: "/lab", icon: <LabIcon /> },
  { label: "Profile", href: "/profile", icon: <ProfileIcon /> },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [navVisible, setNavVisible] = useState(true);

  useEffect(() => {
    const handleDrillStart = () => setNavVisible(false);
    const handleDrillEnd = () => setNavVisible(true);
    window.addEventListener("drill-session-start", handleDrillStart);
    window.addEventListener("drill-session-end", handleDrillEnd);
    return () => {
      window.removeEventListener("drill-session-start", handleDrillStart);
      window.removeEventListener("drill-session-end", handleDrillEnd);
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-base)" }}>
      <ShellErrorBoundary>
        {navVisible && (
          <>
            {/* Desktop nav — top bar */}
            <nav
              style={{
                display: "none",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                height: 56,
                backgroundColor: "rgba(7,7,8,0.8)",
                backdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 32px",
              }}
              className="md-nav"
            >
              {/* Wordmark */}
              <span
                style={{
                  fontFamily: "var(--font-code)",
                  fontSize: 11,
                  letterSpacing: "0.15em",
                  color: "rgba(255,255,255,0.2)",
                  userSelect: "none",
                }}
              >
                AI MASTERY OS
              </span>

              {/* Center tabs */}
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {tabs.map((item) => {
                  const active =
                    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 14px",
                        borderRadius: 5,
                        fontSize: 13,
                        fontFamily: "var(--font-body)",
                        fontWeight: active ? 500 : 400,
                        color: active ? "#eeeef0" : "var(--text-muted)",
                        background: active ? "rgba(79,110,247,0.15)" : "transparent",
                        border: active ? "1px solid rgba(79,110,247,0.3)" : "1px solid transparent",
                        boxShadow: active ? "0 0 12px rgba(79,110,247,0.2) inset" : "none",
                        textDecoration: "none",
                        transition: "color var(--t-fast), background var(--t-fast)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              {/* Gear icon */}
              <Link
                href="/settings"
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "var(--text-muted)",
                  textDecoration: "none",
                  transition: "color var(--t-fast)",
                  padding: 4,
                  borderRadius: 4,
                }}
                aria-label="Settings"
              >
                <GearIcon />
              </Link>
              {/* Gradient accent line */}
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 1,
                background: "linear-gradient(90deg, transparent 0%, rgba(79,110,247,0.5) 30%, rgba(139,92,246,0.5) 70%, transparent 100%)",
                pointerEvents: "none",
              }} />
            </nav>

            {/* Mobile nav — bottom bar */}
            <nav
              style={{
                display: "flex",
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                height: 60,
                backgroundColor: "#0e0e10",
                borderTop: "1px solid #1a1a20",
                alignItems: "center",
                justifyContent: "space-around",
                padding: "0 8px",
              }}
              className="mobile-nav"
            >
              {tabs.map((item) => {
                const active =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 3,
                      flex: 1,
                      padding: "4px 0",
                      color: active ? "var(--text-primary)" : "var(--text-muted)",
                      textDecoration: "none",
                      fontSize: 10,
                      fontFamily: "var(--font-body)",
                      fontWeight: 500,
                      transition: "color var(--t-fast)",
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <Link
                href="/settings"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  flex: 1,
                  padding: "4px 0",
                  color: pathname === "/settings" ? "var(--text-primary)" : "var(--text-muted)",
                  textDecoration: "none",
                  fontSize: 10,
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  transition: "color var(--t-fast)",
                }}
                aria-label="Settings"
              >
                <GearIcon />
                <span>Settings</span>
              </Link>
            </nav>
          </>
        )}
      </ShellErrorBoundary>

      {/* Main content */}
      <main
        style={{
          paddingTop: navVisible ? 56 : 0,
          paddingBottom: navVisible ? 60 : 0,
          minHeight: "100vh",
        }}
        className={navVisible ? "has-nav" : ""}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "32px 24px",
          }}
        >
          {children}
        </div>
      </main>

      <style>{`
        @media (min-width: 768px) {
          .md-nav { display: flex !important; }
          .mobile-nav { display: none !important; }
          main.has-nav { padding-bottom: 0 !important; }
        }
        .md-nav a:hover { color: var(--text-primary) !important; background: rgba(255,255,255,0.04); }
        nav a:hover { color: var(--text-secondary) !important; }
      `}</style>
    </div>
  );
}
