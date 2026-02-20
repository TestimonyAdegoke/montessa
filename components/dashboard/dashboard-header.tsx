"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import type { Session } from "next-auth"
import {
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  HelpCircle,
  Menu,
  Moon,
  Sun,
  LayoutGrid,
  Command,
  Shield,
  Sparkles
} from "lucide-react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn, getInitials } from "@/lib/utils"
import Link from "next/link"

interface DashboardHeaderProps {
  session: Session
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: "bg-red-500/10 text-red-600 border-red-500/20",
  TENANT_ADMIN: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  TEACHER: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  STUDENT: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  GUARDIAN: "bg-green-500/10 text-green-600 border-green-500/20",
}

export default function DashboardHeader({ session }: DashboardHeaderProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")

  const roleLabel = session.user.role.replace(/_/g, " ").toLowerCase()
  const roleColor = ROLE_COLORS[session.user.role] || ROLE_COLORS.TEACHER

  return (
    <header className="sticky top-0 z-40 w-full bg-background/60 backdrop-blur-xl border-b border-border/50 transition-all duration-300">
      <div className="flex h-20 items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-6 flex-1">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("toggle-mobile-nav"))}
            className="p-2.5 rounded-xl text-muted-foreground hover:bg-muted md:hidden transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden md:flex items-center flex-1 max-w-md relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
              <Search className="h-4 w-4" />
            </div>
            <Input
              type="search"
              placeholder="Search anything... (Cmd + K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 pr-12 h-11 bg-muted/40 border-border/50 rounded-2xl focus:bg-background focus:ring-primary/20 transition-all duration-300"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md border border-border bg-background text-[10px] font-bold text-muted-foreground hidden lg:flex items-center gap-1">
              <Command className="w-3 h-3" /> K
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-2xl border border-border/50">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-background/80 transition-all duration-300"
            >
              <Sun className="h-[1.1rem] w-[1.1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.1rem] w-[1.1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-background/80 relative transition-all duration-300"
              asChild
            >
              <Link href="/dashboard/notifications">
                <Bell className="h-[1.1rem] w-[1.1rem]" />
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:flex h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-background/80 transition-all duration-300"
            >
              <LayoutGrid className="h-[1.1rem] w-[1.1rem]" />
            </Button>
          </div>

          <div className="h-8 w-[1px] bg-border/50 mx-1 hidden md:block"></div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-11 w-auto flex items-center gap-3 px-2 rounded-2xl hover:bg-muted/40 transition-all duration-300">
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-sm font-bold text-foreground leading-none">{session.user.name || "User"}</span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-1">{roleLabel}</span>
                </div>
                <Avatar className="h-9 w-9 border-2 border-primary/20 p-0.5 rounded-xl">
                  <AvatarImage src={session.user.image || ""} className="rounded-lg" />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold rounded-lg uppercase">
                    {getInitials(session.user.name || session.user.email || "U")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 rounded-3xl p-2 shadow-2xl border-border/50 backdrop-blur-xl bg-background/95" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 rounded-2xl border-2 border-primary/10 transition-transform hover:scale-105">
                    <AvatarImage src={session.user.image || ""} className="rounded-xl" />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg rounded-xl uppercase">
                      {getInitials(session.user.name || session.user.email || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 overflow-hidden">
                    <p className="text-base font-bold leading-none truncate">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{session.user.email}</p>
                    <Badge variant="outline" className={cn("text-[10px] px-2 py-0.5 w-fit mt-1 border uppercase tracking-wider", roleColor)}>
                      <Shield className="h-2.5 w-2.5 mr-1" />
                      {roleLabel}
                    </Badge>
                  </div>
                </div>
              </DropdownMenuLabel>

              <div className="p-2">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Link href="/dashboard/settings" className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-primary/5 hover:text-primary transition-all group border border-transparent hover:border-primary/10">
                    <Settings className="h-5 w-5 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold">Settings</span>
                  </Link>
                  <Link href="/dashboard/notifications" className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-primary/5 hover:text-primary transition-all group border border-transparent hover:border-primary/10">
                    <Bell className="h-5 w-5 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold">Activity</span>
                  </Link>
                </div>
              </div>

              <DropdownMenuSeparator className="bg-border/50 mx-2" />

              <DropdownMenuItem className="p-3 rounded-2xl cursor-pointer gap-3 m-1">
                <HelpCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Help & Support</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-border/50 mx-2" />

              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="p-3 rounded-2xl cursor-pointer gap-3 m-1 text-destructive focus:text-destructive focus:bg-destructive/10 transition-all font-semibold"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
