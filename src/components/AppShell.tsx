"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
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
  { label: "Dashboard", href: "/", icon: <DashboardIcon />, locked: false },
  { label: "Train", href: "/curriculum", icon: <TrainIcon />, locked: false },
  { label: "Arena", href: "/arena", icon: <ArenaIcon />, locked: true },
  { label: "Lab", href: "/lab", icon: <LabIcon />, locked: true },
  { label: "Profile", href: "/profile", icon: <ProfileIcon />, locked: false },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [navVisible, setNavVisible] = useState(true);
  const [comingSoonTab, setComingSoonTab] = useState<string | null>(null);
  const comingSoonTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  function showComingSoon(href: string) {
    setComingSoonTab(href);
    if (comingSoonTimer.current) clearTimeout(comingSoonTimer.current);
    comingSoonTimer.current = setTimeout(() => setComingSoonTab(null), 2000);
  }

  // Landing page renders its own nav
  if (pathname === '/') return <>{children}</>;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#06070a" }}>
      <ShellErrorBoundary>
        {navVisible && (
          <>

            {/* Desktop nav — top bar */}
            <nav
              className="md-nav"
              style={{
                position: "fixed",
                top: 14,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1000,
                background: "rgba(8,9,12,0.88)",
                backdropFilter: "blur(32px) saturate(220%)",
                WebkitBackdropFilter: "blur(32px) saturate(220%)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 18,
                padding: "0 8px",
                height: 50,
                alignItems: "center",
                gap: 2,
                boxShadow: "0 8px 32px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
                whiteSpace: "nowrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                {/* Wordmark */}
                <Link
                  href="/"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.3em",
                    color: "rgba(255,255,255,0.22)",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    padding: "6px 16px 6px 10px",
                    marginRight: 4,
                    borderRight: "1px solid rgba(255,255,255,0.07)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  AI DOJO
                  <span style={{
                    fontFamily: "var(--font-code)",
                    fontSize: 8,
                    letterSpacing: "0.16em",
                    color: "var(--cyan)",
                    background: "rgba(0,212,255,0.1)",
                    border: "1px solid rgba(0,212,255,0.25)",
                    borderRadius: 4,
                    padding: "1px 5px",
                  }}>BETA</span>
                </Link>

                <div style={{ display: "flex", gap: 2 }}>
                  {tabs.map((item) => {
                    const active = !item.locked && (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href));
                    if (item.locked) {
                      return (
                        <div key={item.href} style={{ position: "relative" }}>
                          <button
                            onClick={() => showComingSoon(item.href)}
                            style={{
                              fontSize: 12.5,
                              fontWeight: 400,
                              color: "rgba(255,255,255,0.35)",
                              padding: "6px 14px",
                              borderRadius: 11,
                              background: "transparent",
                              border: "1px solid transparent",
                              cursor: "default",
                              fontFamily: "inherit",
                            }}
                          >
                            {item.label}
                          </button>
                          <div style={{
                            position: "absolute", top: "100%", left: "50%",
                            transform: "translateX(-50%)",
                            marginTop: 6,
                            background: "rgba(20,21,26,0.95)", border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 6, padding: "4px 10px",
                            fontFamily: "var(--font-code)", fontSize: 10, letterSpacing: "0.1em",
                            color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap",
                            zIndex: 2000, pointerEvents: "none",
                            opacity: comingSoonTab === item.href ? 1 : 0,
                            transition: "opacity 0.2s ease",
                          }}>
                            Coming soon
                          </div>
                        </div>
                      );
                    }
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        style={{
                          fontSize: 12.5,
                          fontWeight: active ? 500 : 400,
                          color: active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.28)",
                          padding: "6px 14px",
                          borderRadius: 11,
                          background: active ? "rgba(255,255,255,0.08)" : "transparent",
                          textDecoration: "none",
                          transition: "all 150ms ease",
                          border: active ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
                        }}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>

                <Link
                  href="/diagnostic"
                  style={{
                    marginLeft: 8,
                    padding: "6px 14px",
                    background: "#fff",
                    borderRadius: 10,
                    color: "#000",
                    fontSize: 12,
                    fontWeight: 700,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Start Diagnostic
                </Link>

                <Link
                  href="/settings"
                  aria-label="Settings"
                  style={{
                    marginLeft: 6,
                    padding: "6px 8px",
                    borderRadius: 10,
                    color: pathname === "/settings" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)",
                    background: pathname === "/settings" ? "rgba(255,255,255,0.08)" : "transparent",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    transition: "all 150ms ease",
                    border: pathname === "/settings" ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
                  }}
                >
                  <GearIcon />
                </Link>
              </div>
            </nav>

            {/* Mobile nav — bottom bar */}
            <nav
              style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                height: 60,
                backgroundColor: "rgba(6,7,10,0.92)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderTop: "1px solid rgba(255,255,255,0.07)",
                alignItems: "center",
                justifyContent: "space-around",
                padding: "0 8px",
              }}
              className="mobile-nav"
            >
              {tabs.map((item) => {
                const active = !item.locked && (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href));
                if (item.locked) {
                  return (
                    <button
                      key={item.href}
                      onClick={() => showComingSoon(item.href)}
                      title="Coming soon"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 3,
                        flex: 1,
                        padding: "4px 0",
                        color: "rgba(255,255,255,0.28)",
                        background: "none",
                        border: "none",
                        fontSize: 10,
                        fontFamily: "'Inter', system-ui, sans-serif",
                        fontWeight: 500,
                        opacity: 0.4,
                        cursor: "default",
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                }
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
                      color: active ? "#ffffff" : "rgba(255,255,255,0.28)",
                      textDecoration: "none",
                      fontSize: 10,
                      fontFamily: "'Inter', system-ui, sans-serif",
                      fontWeight: 500,
                      transition: "color 120ms cubic-bezier(0.4,0,0.2,1)",
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
                  color: pathname === "/settings" ? "#ffffff" : "rgba(255,255,255,0.28)",
                  textDecoration: "none",
                  fontSize: 10,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: 500,
                  transition: "color 120ms cubic-bezier(0.4,0,0.2,1)",
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
        <div className="app-main-inner" style={{ maxWidth: 1320, margin: "0 auto", padding: "40px 28px" }}>
          {children}
        </div>
      </main>

      <style>{`
        @media (min-width: 768px) {
          main.has-nav { padding-bottom: 0 !important; }
        }
        .md-nav a:hover { color: rgba(255,255,255,0.65) !important; background: rgba(255,255,255,0.04) !important; }
        nav a:hover { color: rgba(255,255,255,0.65) !important; }
      `}</style>
    </div>
  );
}
