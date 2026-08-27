"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { theme } from "@/lib/theme"
import { SignInLink } from "./sign-in-link"

interface CheckinFormProps {
  eventId: string
  hasCheckedIn?: boolean
}

export function CheckinForm({ eventId, hasCheckedIn = false }: CheckinFormProps) {
  const { data: session, status } = useSession()
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(hasCheckedIn)

  if (status === "loading") {
    return null
  }

  if (status === "unauthenticated") {
    return (
      <div className={`${theme.card.className} p-4`}>
        <p className="text-sm text-theme-muted">
          <SignInLink className="text-accent hover:text-accent-hover">
            Sign in
          </SignInLink>{" "}
          to check in to this event
        </p>
      </div>
    )
  }

  if (success) {
    return (
      <div className={`${theme.card.className} p-4 border-green-500/50`}>
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="font-medium">You're checked in!</span>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch(`/api/events/${eventId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`${theme.card.className} p-4`}>
      <h3 className={`text-sm font-medium ${theme.text.heading} mb-3`}>
        Event Check-in
      </h3>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Enter 6-digit code"
          maxLength={6}
          pattern="\d{6}"
          className={`${theme.input.className} flex-1 text-center tracking-widest font-mono`}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || code.length !== 6}
          className={theme.button.primary}
        >
          {isLoading ? (
            <svg
              className="animate-spin h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            "Check In"
          )}
        </button>
      </form>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
