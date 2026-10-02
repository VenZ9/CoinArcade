import React from "react";
import "./globals.css";
import { GameStoreProvider } from "../lib/state/game-store";
import { ToastProvider } from "../components/ui/Toast";
import { AppShell } from "../components/layout/AppShell";

export const metadata = {
  title: "Fair Arcade — Transparent Fictional Game Platform",
  description: "Cryptographically unbiased arcade games using fictional in-game Coins with zero monetary value.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-arcade-950 text-arcade-100 min-h-screen">
        <GameStoreProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </GameStoreProvider>
      </body>
    </html>
  );
}
