"use client";
import { useEffect, useState } from "react";
import type { Achievement } from "@/core/storage";

interface AchievementToastProps {
  achievements: Achievement[];
  onDone: () => void;
}

export function AchievementToast({ achievements, onDone }: AchievementToastProps) {
  const [visible, setVisible] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (achievements.length === 0) {
      onDone();
      return;
    }
    const timer = setTimeout(() => {
      if (currentIdx < achievements.length - 1) {
        setCurrentIdx((i) => i + 1);
      } else {
        setVisible(false);
        setTimeout(onDone, 300);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [currentIdx, achievements.length, onDone]);

  if (!visible || achievements.length === 0) return null;

  const current = achievements[currentIdx];

  return (
    <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="rounded-xl border border-amber-500/30 bg-[#0a0a12] shadow-lg shadow-amber-500/10 px-5 py-4 max-w-xs">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest mb-0.5">
              Achievement Unlocked
            </div>
            <div className="text-sm font-semibold text-white">{current.title}</div>
            <div className="text-xs text-gray-400 mt-0.5">{current.description}</div>
          </div>
          <button
            onClick={() => {
              setVisible(false);
              setTimeout(onDone, 100);
            }}
            className="text-gray-600 hover:text-white text-xs ml-1"
          >
            ×
          </button>
        </div>
        {achievements.length > 1 && (
          <div className="mt-2 text-[10px] text-gray-600 text-right">
            {currentIdx + 1}/{achievements.length}
          </div>
        )}
      </div>
    </div>
  );
}
