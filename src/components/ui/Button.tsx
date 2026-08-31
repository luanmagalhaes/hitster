"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "ink" | "magenta" | "aqua" | "outline" | "ghost";
type ButtonSize = "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  ink: "bg-ink text-sun ring-2 ring-ink shadow-[0_5px_0_#000] hover:bg-ink-soft hover:shadow-[0_7px_0_#000] active:shadow-[0_2px_0_#000]",
  magenta:
    "bg-magenta text-cream ring-2 ring-ink shadow-[0_5px_0_var(--color-ink)] hover:bg-magenta-soft hover:text-ink hover:shadow-[0_7px_0_var(--color-ink)] active:shadow-[0_2px_0_var(--color-ink)]",
  aqua: "bg-aqua text-ink ring-2 ring-ink shadow-[0_5px_0_var(--color-ink)] hover:bg-aqua-soft hover:shadow-[0_7px_0_var(--color-ink)] active:shadow-[0_2px_0_var(--color-ink)]",
  outline:
    "bg-paper text-ink ring-2 ring-ink shadow-[0_5px_0_var(--color-ink)] hover:bg-sun-light hover:shadow-[0_7px_0_var(--color-ink)] active:shadow-[0_2px_0_var(--color-ink)]",
  ghost:
    "bg-transparent text-ink/70 ring-2 ring-ink/25 hover:bg-ink/8 hover:text-ink hover:ring-ink/45",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-4 text-base sm:text-lg",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "ink",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`display gpu cursor-pointer rounded-2xl tracking-tight transition-[transform,box-shadow,background-color,color] duration-150 ease-[var(--ease-snap)] hover:-translate-y-[2px] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-ink active:translate-y-[3px] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:active:translate-y-0 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
