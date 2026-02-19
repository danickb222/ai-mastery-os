"use client";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  color?: string;
  size?: "sm" | "md";
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = true,
  color = "bg-indigo-500",
  size = "md",
  className = "",
}: ProgressBarProps) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  const h = size === "sm" ? "h-1.5" : "h-2.5";

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="mb-1 flex items-center justify-between text-xs">
          {label && <span className="text-gray-400">{label}</span>}
          {showPercent && <span className="text-gray-500">{percent}%</span>}
        </div>
      )}
      <div className={`w-full ${h} rounded-full bg-white/10`}>
        <div
          className={`${h} rounded-full ${color} transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
