"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AuditIcon,
  CoinIcon,
  GamepadIcon,
  HomeIcon,
  InventoryIcon,
  ProfileIcon,
} from "../icons";
import { useGameStore } from "../../lib/state/game-store";

export const AppNavigation: React.FC = () => {
  const pathname = usePathname();
  const { profile } = useGameStore();

  const navItems = [
    { label: "Home", href: "/", icon: HomeIcon },
    { label: "Games", href: "/games", icon: GamepadIcon },
    { label: "Inventory", href: "/inventory", icon: InventoryIcon },
    { label: "Profile", href: "/profile", icon: ProfileIcon },
  ];

  const isNavActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* =========================================
          DESKTOP SIDEBAR (Visible on md and up)
         ========================================= */}
      <aside className="hidden md:flex flex-col justify-between w-64 h-screen fixed left-0 top-0 bg-arcade-950 border-r border-arcade-850 p-4 z-40 select-none">
        <div>
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 px-3 py-3 mb-6 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-arcade-950 font-black text-xl shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              🕹️
            </div>
            <div>
              <span className="font-black text-base tracking-tight text-white block leading-tight">
                COIN ARCADE
              </span>
              <span className="font-mono text-[10px] text-brand-400 font-bold uppercase tracking-wider block">
                Crypto-Fair Points
              </span>
            </div>
          </Link>

          {/* Player Quick Bar */}
          <div className="bg-arcade-900 border border-arcade-800 rounded-xl p-3 mb-6">
            <div className="flex items-center justify-between text-xs text-arcade-400 mb-1.5">
              <span>Points Balance</span>
              <span className="font-mono text-brand-300 font-bold">LVL {profile.level}</span>
            </div>
            <div className="flex items-center gap-1.5 text-brand-400 font-mono font-black text-lg">
              <CoinIcon size={20} />
              <span>{profile.coins.toLocaleString()}</span>
              <span className="text-xs font-sans text-arcade-400 font-normal">Coins</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1.5" aria-label="Main navigation">
            {navItems.map((item) => {
              const active = isNavActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    active
                      ? "bg-brand-500/10 text-brand-300 border border-brand-500/30 font-bold"
                      : "text-arcade-400 hover:text-white hover:bg-arcade-900"
                  }`}
                >
                  <Icon size={18} className={active ? "text-brand-400" : "text-arcade-400"} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Dev / Fairness Link */}
        <div className="pt-4 border-t border-arcade-850">
          <Link
            href="/debug/fairness"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-colors ${
              pathname === "/debug/fairness"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold"
                : "text-arcade-500 hover:text-arcade-300"
            }`}
          >
            <AuditIcon size={16} />
            <span>Fairness Audit</span>
          </Link>
          <p className="text-[10px] text-arcade-600 px-3 mt-2">
            100% Fictional Coins. Zero real-money value.
          </p>
        </div>
      </aside>

      {/* =========================================
          MOBILE BOTTOM NAVIGATION (Visible below md)
         ========================================= */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-arcade-950/95 border-t border-arcade-850 backdrop-blur-md z-40 px-3 flex items-center justify-around select-none"
        aria-label="Mobile navigation"
      >
        {navItems.map((item) => {
          const active = isNavActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors ${
                active ? "text-brand-400 font-bold" : "text-arcade-400 hover:text-arcade-200"
              }`}
            >
              <Icon size={20} className={active ? "text-brand-400" : "text-arcade-400"} />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};
