"use client";

import React, { useState, useEffect } from "react";
import { CoinIcon } from "../icons";

export interface WagerControlProps {
  balance: number;
  minimum: number;
  maximum: number;
  value: number;
  onChange: (value: number) => void;
  quickAmounts?: number[];
  disabled?: boolean;
}

export const WagerControl: React.FC<WagerControlProps> = ({
  balance,
  minimum,
  maximum,
  value,
  onChange,
  quickAmounts = [10, 50, 100, 500],
  disabled = false,
}) => {
  const effectiveMax = Math.min(maximum, Math.max(0, balance));
  const [inputValue, setInputValue] = useState(String(value));

  // Keep internal string input in sync when external value changes
  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const commitValue = (num: number) => {
    if (isNaN(num) || !isFinite(num)) {
      onChange(minimum);
      setInputValue(String(minimum));
      return;
    }
    const whole = Math.floor(num);
    const clamped = Math.max(minimum, Math.min(effectiveMax, whole));
    onChange(clamped);
    setInputValue(String(clamped));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value.replace(/[^0-9]/g, "");
    setInputValue(text);
    if (text !== "") {
      const parsed = parseInt(text, 10);
      if (!isNaN(parsed) && isFinite(parsed)) {
        commitValue(parsed);
      }
    }
  };

  const handleBlur = () => {
    if (!inputValue || inputValue === "") {
      commitValue(minimum);
    } else {
      commitValue(parseInt(inputValue, 10));
    }
  };

  const handleStep = (delta: number) => {
    if (disabled) return;
    const current = typeof value === "number" && !isNaN(value) ? value : minimum;
    commitValue(current + delta);
  };

  const handleQuickAmount = (amount: number) => {
    if (disabled) return;
    commitValue(amount);
  };

  const handleMax = () => {
    if (disabled) return;
    commitValue(effectiveMax);
  };

  const isInvalid = value > balance || value < minimum || balance < minimum;

  return (
    <div className="w-full bg-arcade-900 border border-arcade-800 rounded-xl p-3.5 shadow-sm">
      <div className="flex items-center justify-between text-xs font-medium text-arcade-400 mb-2">
        <span className="uppercase tracking-wider">Wager Amount</span>
        <div className="flex items-center gap-1.5 text-arcade-200">
          <span>Balance:</span>
          <span className="font-mono font-bold text-brand-400">{balance.toLocaleString()}</span>
          <CoinIcon size={14} className="text-brand-400" />
        </div>
      </div>

      {/* Main stepper and direct input */}
      <div className="flex items-center gap-2 mb-2.5">
        <button
          type="button"
          disabled={disabled || value <= minimum}
          onClick={() => handleStep(-Math.max(1, minimum))}
          aria-label="Decrease wager"
          className="w-11 h-11 flex items-center justify-center rounded-lg bg-arcade-800 hover:bg-arcade-750 active:bg-arcade-700 text-arcade-100 font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors select-none"
        >
          -
        </button>

        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            disabled={disabled}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            aria-label="Wager in Coins"
            className={`w-full h-11 px-4 pr-16 bg-arcade-950 border rounded-lg text-center font-mono font-bold text-lg text-white focus:outline-none transition-colors ${
              isInvalid
                ? "border-loss text-loss-light focus:border-loss"
                : "border-arcade-700 focus:border-brand-500"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none text-brand-400 font-semibold text-xs uppercase tracking-wider">
            <span>Coins</span>
            <CoinIcon size={15} />
          </div>
        </div>

        <button
          type="button"
          disabled={disabled || value >= effectiveMax}
          onClick={() => handleStep(Math.max(1, minimum))}
          aria-label="Increase wager"
          className="w-11 h-11 flex items-center justify-center rounded-lg bg-arcade-800 hover:bg-arcade-750 active:bg-arcade-700 text-arcade-100 font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors select-none"
        >
          +
        </button>
      </div>

      {/* Quick selection buttons */}
      <div className="grid grid-cols-5 gap-1.5">
        {quickAmounts.map((amt) => (
          <button
            key={amt}
            type="button"
            disabled={disabled || amt > effectiveMax}
            onClick={() => handleQuickAmount(amt)}
            className={`py-1.5 px-1 rounded-md text-xs font-mono font-semibold transition-all select-none ${
              value === amt
                ? "bg-brand-500 text-arcade-950 font-bold"
                : "bg-arcade-850 hover:bg-arcade-800 text-arcade-200 border border-arcade-800"
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            {amt}
          </button>
        ))}
        <button
          type="button"
          disabled={disabled || effectiveMax <= 0}
          onClick={handleMax}
          className={`py-1.5 px-1 rounded-md text-xs font-mono font-bold transition-all select-none ${
            value === effectiveMax && effectiveMax > 0
              ? "bg-brand-500 text-arcade-950"
              : "bg-arcade-800 hover:bg-arcade-750 text-brand-400 border border-brand-500/30"
          } disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          MAX
        </button>
      </div>

      {/* Validation feedback */}
      {isInvalid && (
        <p className="mt-2 text-xs text-loss-light text-center font-medium">
          {balance < minimum
            ? `Insufficient balance (minimum wager is ${minimum} Coins).`
            : value > balance
            ? "Wager exceeds your current balance."
            : `Wager must be between ${minimum} and ${effectiveMax} Coins.`}
        </p>
      )}
    </div>
  );
};
