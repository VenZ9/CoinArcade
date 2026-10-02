"use client";

import React from "react";

export interface WheelSegment {
  id: string;
  label: string;
  multiplier: number;
  color: string;
}

export interface WheelVisualProps {
  segments: WheelSegment[];
  rotationDegrees: number;
  isSpinning?: boolean;
  size?: number;
  className?: string;
}

export const WheelVisual: React.FC<WheelVisualProps> = ({
  segments,
  rotationDegrees,
  isSpinning = false,
  size = 280,
  className = "",
}) => {
  const center = size / 2;
  const radius = center - 12;
  const count = segments.length;
  const anglePerSegment = 360 / count;

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Pointer indicator at top (12 o'clock) */}
      <div className="absolute top-0 z-20 -translate-y-1 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 drop-shadow-md" />

      {/* Outer wheel ring */}
      <div
        className="rounded-full p-2 bg-arcade-950 border-4 border-arcade-800 shadow-2xl relative"
        style={{ width: size, height: size }}
      >
        <svg
          width={size - 16}
          height={size - 16}
          viewBox={`0 0 ${size} ${size}`}
          className="transition-transform"
          style={{
            transform: `rotate(${rotationDegrees}deg)`,
            transitionDuration: isSpinning ? "3.2s" : "0s",
            transitionTimingFunction: "cubic-bezier(0.12, 0.85, 0.25, 1.0)",
          }}
        >
          {segments.map((seg, idx) => {
            const startAngle = (idx * anglePerSegment - 90) * (Math.PI / 180);
            const endAngle = ((idx + 1) * anglePerSegment - 90) * (Math.PI / 180);

            const x1 = center + radius * Math.cos(startAngle);
            const y1 = center + radius * Math.sin(startAngle);
            const x2 = center + radius * Math.cos(endAngle);
            const y2 = center + radius * Math.sin(endAngle);

            const path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

            // Text position halfway along radius
            const textAngle = ((idx + 0.5) * anglePerSegment - 90) * (Math.PI / 180);
            const textRadius = radius * 0.65;
            const tx = center + textRadius * Math.cos(textAngle);
            const ty = center + textRadius * Math.sin(textAngle);
            const textRotation = (idx + 0.5) * anglePerSegment;

            return (
              <g key={seg.id || idx}>
                <path d={path} fill={seg.color} stroke="#090d16" strokeWidth="2" />
                <text
                  x={tx}
                  y={ty}
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="central"
                  transform={`rotate(${textRotation}, ${tx}, ${ty})`}
                  className="font-mono drop-shadow"
                >
                  {seg.label}
                </text>
              </g>
            );
          })}

          {/* Center Hub */}
          <circle cx={center} cy={center} r="20" fill="#0f1524" stroke="#f59e0b" strokeWidth="3" />
          <circle cx={center} cy={center} r="7" fill="#f59e0b" />
        </svg>
      </div>
    </div>
  );
};
