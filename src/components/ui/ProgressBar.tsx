"use client";
import { useEffect, useState } from "react";

interface ProgressBarProps {
  value: number;
  animated?: boolean;
  delay?: number;
  className?: string;
  color?: "blue" | "green" | "yellow" | "red";
  size?: "sm" | "md";
  showPercent?: boolean;
  label?: string;
}

const colorMap: Record<string, string> = {
  blue: "var(--accent)",
  green: "var(--success)",
  yellow: "var(--warning)",
  red: "var(--danger)",
};

export function ProgressBar({
  value,
  animated = true,
  delay = 0,
  className = "",
  color = "blue",
  size = "sm",
  showPercent = false,
  label,
}: ProgressBarProps) {
  const [width, setWidth] = useState(0);
  const clamped = Math.min(100, Math.max(0, value));
  const height = size === "sm" ? 3 : 6;

  useEffect(() => {
    if (!animated) {
      setWidth(clamped);
      return;
    }
    const t = setTimeout(() => {
      setWidth(clamped);
    }, delay);
    return () => clearTimeout(t);
  }, [clamped, animated, delay]);

  return (
    <div className={className} style={{ width: "100%" }}>
      {(label || showPercent) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          {label && (
            <span className="t-label" style={{ color: "var(--text-muted)" }}>
              {label}
            </span>
          )}
          {showPercent && (
            <span className="t-label" style={{ color: "var(--text-muted)" }}>
              {clamped}%
            </span>
          )}
        </div>
      )}
      <div
        className="progress-track"
        style={{ height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}
      >
        <div
          className="progress-fill"
          style={{
            height: "100%",
            borderRadius: 2,
            background: "var(--cyan)",
            boxShadow: "0 0 6px rgba(0,212,255,0.5)",
            width: `${width}%`,
            transition: "width 2.4s cubic-bezier(0,0,0.2,1)",
          }}
        />
      </div>
    </div>
  );
}
