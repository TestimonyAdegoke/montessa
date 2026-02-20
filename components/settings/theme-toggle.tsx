"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Laptop } from "lucide-react"
import { useTransition } from "react"

export default function ThemeToggle() {
  const { setTheme, theme, systemTheme } = useTheme()
  const [isPending, startTransition] = useTransition()

  const current = theme === "system" ? systemTheme : theme

  const apply = (next: "light" | "dark" | "system") => {
    setTheme(next)
    const pref = next === "light" ? "LIGHT" : next === "dark" ? "DARK" : "SYSTEM"
    startTransition(async () => {
      try {
        await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ themePreference: pref }),
        })
      } catch {}
    })
  }

  return (
    <div className="flex gap-4">
      <Button type="button" variant={current === "light" ? "default" : "outline"} className="flex-1" onClick={() => apply("light")} disabled={isPending}>
        <Sun className="mr-2 h-4 w-4" />
        Light
      </Button>
      <Button type="button" variant={current === "dark" ? "default" : "outline"} className="flex-1" onClick={() => apply("dark")} disabled={isPending}>
        <Moon className="mr-2 h-4 w-4" />
        Dark
      </Button>
      <Button type="button" variant={theme === "system" ? "default" : "outline"} className="flex-1" onClick={() => apply("system")} disabled={isPending}>
        <Laptop className="mr-2 h-4 w-4" />
        System
      </Button>
    </div>
  )
}
