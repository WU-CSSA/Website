"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { theme } from "@/lib/theme"

interface OnboardingFormProps {
  defaultName: string
  userImage?: string
  callbackUrl?: string
}

export function OnboardingForm({ defaultName, userImage, callbackUrl }: OnboardingFormProps) {
  const [displayName, setDisplayName] = useState(defaultName)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { update } = useSession()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ displayName: displayName.trim() || null }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to complete onboarding")
      }

      // Update the session with new data to avoid middleware redirect
      await update({
        displayName: displayName.trim() || null,
        hasCompletedOnboarding: true,
      })

      router.push(callbackUrl || "/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {userImage && (
        <div className="flex justify-center">
          <img
            src={userImage}
            alt="Your avatar"
            className="w-20 h-20 rounded-full border-2 border-theme-border"
          />
        </div>
      )}

      <div>
        <label htmlFor="displayName" className={theme.label.className}>
          Display Name
        </label>
        <input
          type="text"
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your preferred name"
          className={theme.input.className}
          autoFocus
        />
        <p className="mt-2 text-xs text-theme-muted">
          This is how other members will see you. You can change this later.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`${theme.button.primary} w-full`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Setting up...
          </span>
        ) : (
          "Continue"
        )}
      </button>
    </form>
  )
}
