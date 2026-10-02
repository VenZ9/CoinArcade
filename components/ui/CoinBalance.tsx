import React from "react";
import { CoinIcon } from "../icons";

export interface CoinBalanceProps {
  balance: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
}

export const CoinBalance: React.FC<CoinBalanceProps> = ({
  balance,
  size = "md",
  className = "",
  showLabel = false,
}) => {
  const sizeClasses = {
    sm: "text-xs px-2.5 py-1 gap-1",
    md: "text-sm px-3 py-1.5 gap-1.5",
    lg: "text-lg px-4 py-2 gap-2",
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  return (
    <div
      className={`inline-flex items-center rounded-lg bg-arcade-900 border border-arcade-800 text-brand-400 font-mono font-bold select-none ${sizeClasses[size]} ${className}`}
      title={`${balance.toLocaleString()} Fictional Arcade Coins`}
    >
      <CoinIcon size={iconSizes[size]} className="text-brand-400 flex-shrink-0" />
      <span className="tracking-tight">{balance.toLocaleString()}</span>
      {showLabel && <span className="text-arcade-400 text-xs font-sans font-medium ml-0.5">Coins</span>}
    </div>
  );
};
