"use client";
import { useState, useEffect } from "react";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>AI Mastery OS</title>
        <meta name="description" content="Drill-based training system for applied AI operators. Build your Operator Score." />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0b0b12" />
      </head>
      <body>
        {navVisible && <AppShell>{children}</AppShell>}
        {!navVisible && children}
      </body>
    </html>
  );
}