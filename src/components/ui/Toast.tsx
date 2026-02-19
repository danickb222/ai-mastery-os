"use client";
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

const typeStyles = {
  success: "bg-emerald-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-indigo-600 text-white",
};

export function Toast({ message, type = "success", onClose, duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 rounded-lg px-5 py-3 shadow-lg transition-all duration-300 ${
        typeStyles[type]
      } ${visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
    >
      {message}
    </div>
  );
}
