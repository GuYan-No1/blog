"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useMounted } from "@/hooks/use-mounted";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  // 服务端渲染占位，保持布局尺寸一致，无水合不匹配
  if (!mounted) {
    return <div className="h-8 w-8" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted
                 transition-colors hover:bg-bg-elevated hover:text-accent"
      aria-label="切换主题"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
