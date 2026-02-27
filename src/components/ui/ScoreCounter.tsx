"use client";
import { useEffect, useState } from "react";

interface ScoreCounterProps {
  target: number;
  duration?: number;
  delay?: number;
  className?: string;
  suffix?: string;
}

export function ScoreCounter({
  target,
  duration = 1200,
  delay = 0,
  className = "",
  suffix = "",
}: ScoreCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    let startTime: number | null = null;

    const timer = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (startTime === null) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(target * eased));
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };
      animationFrame = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [target, duration, delay]);

  return (
    <span className={className}>
      {count}
      {suffix}
    </span>
  );
}
