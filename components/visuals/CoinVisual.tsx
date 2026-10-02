import React from "react";

export interface CoinVisualProps {
  side: "heads" | "tails";
  isFlipping?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const CoinVisual: React.FC<CoinVisualProps> = ({
  side,
  isFlipping = false,
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-16 h-16 text-lg",
    md: "w-28 h-28 text-3xl",
    lg: "w-36 h-36 text-5xl",
  };

  return (
    <div
      className={`relative rounded-full select-none flex items-center justify-center font-black font-mono transition-all duration-300 ${
        sizeClasses[size]
      } ${isFlipping ? "animate-spin" : "animate-pop"} ${className}`}
      style={{
        background: "radial-gradient(circle at 35% 35%, #fde047 0%, #eab308 55%, #ca8a04 100%)",
        boxShadow:
          "0 0 0 4px #a16207, 0 8px 0 #854d0e, 0 15px 25px -5px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Outer coin ridge border */}
      <div className="absolute inset-1.5 rounded-full border-2 border-dashed border-amber-600/70 pointer-events-none" />

      {/* Inner face label */}
      <span className="text-amber-950 drop-shadow-sm uppercase tracking-tighter">
        {side === "heads" ? "H" : "T"}
      </span>

      <span className="absolute bottom-2 text-[10px] uppercase font-bold text-amber-900/80 tracking-widest font-sans">
        {side}
      </span>
    </div>
  );
};
