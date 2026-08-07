"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";

export function ThemeToggleCard() {
  const { theme, setTheme } = useTheme();
  return (
    <Card className="mb-6 p-5">
      <h3 className="text-sm font-medium">Appearance</h3>
      <p className="mt-1 text-xs text-omniv-text-muted">
        Switch between dark and light. Your choice stays on this device.
      </p>
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          variant={theme === "dark" ? "primary" : "outline"}
          className="gap-1.5"
          onClick={() => setTheme("dark")}
        >
          <Moon className="h-3.5 w-3.5" />
          Dark
        </Button>
        <Button
          size="sm"
          variant={theme === "light" ? "primary" : "outline"}
          className="gap-1.5"
          onClick={() => setTheme("light")}
        >
          <Sun className="h-3.5 w-3.5" />
          Light
        </Button>
      </div>
    </Card>
  );
}
