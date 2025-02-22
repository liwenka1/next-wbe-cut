"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  // next-themes
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };
  const toggleViewTransition = (event: React.MouseEvent<HTMLDivElement>) => {
    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`];

    const transition = document.startViewTransition(() => {
      toggleTheme();
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: isDark ? [...clipPath].reverse() : clipPath
        },
        {
          duration: 300,
          easing: "ease-in",
          pseudoElement: isDark ? "::view-transition-old(root)" : "::view-transition-new(root)"
        }
      );
    });
  };
  const handleToggleTheme = (event: React.MouseEvent<HTMLDivElement>) => {
    const isSupport = document.startViewTransition() && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isSupport) {
      toggleTheme();
      return;
    }

    toggleViewTransition(event);
  };

  return (
    <div
      className={cn(
        "flex h-8 w-16 cursor-pointer rounded-full bg-gray-600 p-1 transition-all duration-300",
        isDark ? "border border-zinc-800" : "border border-zinc-200",
        className
      )}
      onClick={handleToggleTheme}
      role="button"
      tabIndex={0}
    >
      <div className="flex w-full items-center justify-between">
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300",
            isDark ? "translate-x-0 transform bg-zinc-800" : "translate-x-8 transform bg-gray-200"
          )}
        >
          {isDark ? (
            <Moon className="h-4 w-4 text-white" strokeWidth={1.5} />
          ) : (
            <Sun className="h-4 w-4 text-gray-700" strokeWidth={1.5} />
          )}
        </div>
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300",
            isDark ? "bg-transparent" : "-translate-x-8 transform"
          )}
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-gray-500" strokeWidth={1.5} />
          ) : (
            <Moon className="h-4 w-4 text-black" strokeWidth={1.5} />
          )}
        </div>
      </div>
    </div>
  );
}
