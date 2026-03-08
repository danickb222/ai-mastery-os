"use client";
import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

const variants: Record<string, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "btn-secondary",
  ghost: "btn-ghost",
  cyan: "btn-cyan",
};

const sizes: Record<string, string> = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
};

export function Button({ children, variant = "primary", size = "md", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`btn ${variants[variant] || "btn-primary"} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
