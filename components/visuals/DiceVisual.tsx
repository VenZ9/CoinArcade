import React from "react";

export interface DiceVisualProps {
  value: number; // 1..6
  isRolling?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  isWinning?: boolean;
}

export const DiceVisual: React.FC<DiceVisualProps> = ({
  value,
  isRolling = false,
  size = "md",
  className = "",
  isWinning = false,
}) => {
  const sizeClasses = {
    sm: "w-12 h-12 p-1.5 rounded-lg",
    md: "w-18 h-18 p-2.5 rounded-xl",
    lg: "w-24 h-24 p-3.5 rounded-2xl",
  };

  const dotSizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  // 3x3 grid dot coordinates for faces 1-6
  const dotsByValue: Record<number, number[]> = {
    1: [4], // center
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };

  const activeDots = dotsByValue[value] || [4];

  return (
    <div
      className={`relative ${sizeClasses[size]} bg-white border-2 ${
        isWinning ? "border-win ring-4 ring-win/30" : "border-slate-300"
      } shadow-lg flex items-center justify-center transition-transform select-none ${
        isRolling ? "animate-spin" : ""
      } ${className}`}
      style={{
        boxShadow: "0 6px 0 #cbd5e1, 0 10px 15px -3px rgba(0,0,0,0.4)",
      }}
    >
      <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0.5">
        {Array.from({ length: 9 }).map((_, idx) => (
          <div key={idx} className="flex items-center justify-center">
            {activeDots.includes(idx) && (
              <div
                className={`${dotSizeClasses[size]} rounded-full ${
                  isWinning ? "bg-win" : "bg-slate-900"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
