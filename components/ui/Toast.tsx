"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckIcon, CloseIcon, InfoIcon, ShieldAlertIcon } from "../icons";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev.slice(-3), { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-20 md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium shadow-xl backdrop-blur-md animate-pop ${
              toast.type === "success"
                ? "bg-arcade-900/95 border-win/50 text-white shadow-win/10"
                : toast.type === "error"
                ? "bg-arcade-900/95 border-loss/50 text-white shadow-loss/10"
                : "bg-arcade-900/95 border-arcade-700 text-arcade-100"
            }`}
          >
            {toast.type === "success" && <CheckIcon size={18} className="text-win-light flex-shrink-0" />}
            {toast.type === "error" && <ShieldAlertIcon size={18} className="text-loss-light flex-shrink-0" />}
            {toast.type === "info" && <InfoIcon size={18} className="text-brand-400 flex-shrink-0" />}

            <span className="flex-1">{toast.message}</span>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-arcade-400 hover:text-white p-0.5"
              aria-label="Dismiss notification"
            >
              <CloseIcon size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
