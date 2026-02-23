"use client"

import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"

export function TopNav() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="flex items-center justify-between bg-background/95 backdrop-blur-sm pl-5 pr-3 h-12 shrink-0 border-b border-foreground/[0.06] supports-[backdrop-filter]:bg-background/80">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <span className="font-brand text-[14px] font-semibold tracking-tight text-foreground select-none" style={{ fontFeatureSettings: '"ss01"' }}>
          markpad
        </span>
        <span className="hidden sm:block h-3.5 w-px bg-foreground/[0.1]" />
        <span className="hidden sm:block text-[11px] text-muted-foreground/50 dark:text-muted-foreground/40 select-none">
          Markdown Editor
        </span>
      </div>

      <div className="flex-1" />

      {/* Theme toggle */}
      <div className="flex items-center">
        {mounted ? (
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
            title="Toggle theme (⌘K)"
            className="group relative flex items-center justify-center h-9 w-9 rounded-xl text-foreground/35 hover:text-foreground/75 transition-all duration-200 cursor-pointer"
          >
            <span className="absolute inset-0 rounded-xl bg-foreground/0 group-hover:bg-foreground/[0.04] group-active:bg-foreground/[0.06] transition-colors duration-200" />
            <div className="relative">
              <Sun
                className={`h-[15px] w-[15px] transition-all duration-300 ${
                  resolvedTheme === "dark"
                    ? "rotate-0 scale-100 opacity-100"
                    : "rotate-90 scale-0 opacity-0 absolute"
                }`}
                strokeWidth={1.5}
              />
              <Moon
                className={`h-[15px] w-[15px] transition-all duration-300 ${
                  resolvedTheme === "light"
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-0 opacity-0 absolute"
                }`}
                strokeWidth={1.5}
              />
            </div>
          </button>
        ) : (
          <div className="h-9 w-9" />
        )}
      </div>
    </header>
  )
}
