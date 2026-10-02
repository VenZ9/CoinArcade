"use client";

import React from "react";

export interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const GameButton: React.FC<GameButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  onClick,
  ...props
}) => {
  const [isThrottled, setIsThrottled] = React.useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading || isThrottled) return;
    setIsThrottled(true);
    setTimeout(() => setIsThrottled(false), 250); // prevent rapid double clicks
    if (onClick) onClick(e);
  };

  const baseClasses =
    "inline-flex items-center justify-center font-bold tracking-wide rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-arcade-950 select-none disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]";

  const variantClasses = {
    primary:
      "bg-brand-500 hover:bg-brand-400 text-arcade-950 shadow-sm shadow-brand-500/20 focus:ring-brand-500",
    secondary:
      "bg-arcade-800 hover:bg-arcade-750 text-arcade-100 border border-arcade-700 focus:ring-arcade-600",
    success:
      "bg-win hover:bg-win-light text-arcade-950 shadow-sm shadow-win/20 focus:ring-win",
    danger:
      "bg-loss hover:bg-loss-light text-white shadow-sm shadow-loss/20 focus:ring-loss",
    outline:
      "bg-transparent hover:bg-arcade-850 text-arcade-200 border border-arcade-700 focus:ring-arcade-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2.5",
  };

  return (
    <button
      disabled={disabled || loading || isThrottled}
      onClick={handleClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
};
