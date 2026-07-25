"use client"

import { signOut } from "next-auth/react"

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="px-3 py-2 text-sm font-medium text-theme-secondary hover:text-theme-primary hover:bg-theme-hover rounded-lg transition-colors"
    >
      Sign Out
    </button>
  )
}
