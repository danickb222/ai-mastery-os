"use client";
import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "accent";
  className?: string;
  onClick?: () => void;
}

const variants: Record<string, string> = {
  default: "badge badge-advanced",
  foundational: "badge badge-foundational",
  FOUNDATIONAL: "badge badge-foundational",
  advanced: "badge badge-advanced",
  ADVANCED: "badge badge-advanced",
  expert: "badge badge-expert",
  EXPERT: "badge badge-expert",
  success: "badge badge-foundational",
  warning: "badge badge-expert",
  danger: "badge badge-expert",
  accent: "badge badge-foundational",
};

export function Badge({ children, variant = "default", className = "", onClick }: BadgeProps) {
  return (
    <span 
      onClick={onClick}
      className={`${variants[variant] || "badge badge-advanced"} ${className} ${onClick ? "cursor-pointer" : ""}`}
    >
      {children}
    </span>
  );
}
