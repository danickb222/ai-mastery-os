"use client";
import { useEffect, useState } from "react";

interface ArenaCountdownProps {
  onComplete: () => void;
}

export function ArenaCountdown({ onComplete }: ArenaCountdownProps) {
  const [currentNumber, setCurrentNumber] = useState(3);

  useEffect(() => {
    if (currentNumber === 0) {
      setTimeout(onComplete, 200);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentNumber(currentNumber - 1);
    }, 900);

    return () => clearTimeout(timer);
  }, [currentNumber, onComplete]);

  if (currentNumber === 0) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(7,7,8,0.97)] z-[100] flex items-center justify-center animate-fade-in">
      <div className="text-center">
        <div
          key={currentNumber}
          className="text-[120px] font-bold animate-countdown-number"
          style={{ 
            animation: "countdownNumber 700ms ease-out forwards",
            color: "var(--text-primary)"
          }}
        >
          {currentNumber}
        </div>
        <div
          key={`line-${currentNumber}`}
          className="w-[200px] h-[2px] mx-auto mt-8"
          style={{
            background: "var(--accent)",
            animation: "countdownLine 800ms linear forwards"
          }}
        />
      </div>
    </div>
  );
}
