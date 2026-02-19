import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Mastery OS",
  description: "Beginner to top 1% applied AI operator training",
  manifest: "/manifest.webmanifest",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AI Mastery",
  },
  icons: {
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

