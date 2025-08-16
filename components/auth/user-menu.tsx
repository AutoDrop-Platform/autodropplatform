"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings, AlertCircle } from "lucide-react"
import { getCurrentUser, signOut, isSupabaseConfigured } from "@/lib/auth"
import { SetupAuthDialog } from "./setup-auth-dialog"

export function UserMenu() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [authConfigured, setAuthConfigured] = useState(true)
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      if (!isSupabaseConfigured()) {
        setAuthConfigured(false)
        setIsLoading(false)
        return
      }

      try {
        const { user } = await getCurrentUser()
        setUser(user)
      } catch (error) {
        console.log("[v0] Auth error:", error)
        setAuthConfigured(false)
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
    router.refresh()
  }

  if (isLoading) {
    return <div className="w-8 h-8 bg-slate-200 rounded-full animate-pulse" />
  }

  if (!authConfigured) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          className="text-amber-600 border-amber-200 bg-transparent"
          onClick={() => setShowSetupDialog(true)}
        >
          <AlertCircle className="mr-2 h-4 w-4" />
          Setup Auth
        </Button>
        <SetupAuthDialog open={showSetupDialog} onOpenChange={setShowSetupDialog} />
      </>
    )
  }

  if (!user) {
    return (
      <Button onClick={() => router.push("/login")} variant="outline" size="sm">
        Sign In
      </Button>
    )
  }

  const userInitials = user.email?.charAt(0).toUpperCase() || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-500 text-white">{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Account</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
