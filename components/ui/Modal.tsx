"use client";

import React, { useEffect } from "react";
import { CloseIcon } from "../icons";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "md",
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-pop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-arcade-900 border border-arcade-750 rounded-2xl shadow-2xl p-6 z-10 max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-arcade-800 mb-4">
          <h2 id="modal-title" className="text-lg font-bold text-white tracking-wide">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-arcade-400 hover:text-white hover:bg-arcade-800 transition-colors"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="overflow-y-auto pr-1 text-sm text-arcade-200 space-y-3">
          {children}
        </div>
      </div>
    </div>
  );
};
