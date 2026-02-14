"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";

export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <div className="flex items-center gap-2">
      <Sun
        className={`h-5 w-5 transition-colors ${
          isDark ? " text-gray-400" : "text-foreground"
        }`}
      />

      <Switch
      className="cursor-pointer"
        checked={isDark}
        onCheckedChange={(checked) =>
          setTheme(checked ? "dark" : "light")
        }
        aria-label="Toggle theme"
      />

      <Moon
        className={`h-5 w-5 transition-colors ${
          isDark ? "text-foreground" : "text-gray-400"
        }`}
      />
    </div>
  );
}
