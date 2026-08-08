"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { theme } from "@/lib/theme"

interface RsvpButtonProps {
  eventId: string
  initialRsvpCount?: number
  initialHasRsvped?: boolean
}

export function RsvpButton({
  eventId,
  initialRsvpCount = 0,
  initialHasRsvped = false,
}: RsvpButtonProps) {
  const { data: session, status } = useSession()
  const [hasRsvped, setHasRsvped] = useState(initialHasRsvped)
  const [rsvpCount, setRsvpCount] = useState(initialRsvpCount)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      fetch(`/api/events/${eventId}/rsvp`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            setHasRsvped(data.hasRsvped)
            setRsvpCount(data.rsvpCount)
          }
        })
        .catch(console.error)
    }
  }, [eventId, status])

  const handleRsvp = async () => {
    if (status !== "authenticated") {
      window.location.href = "/login"
      return
    }

    setIsLoading(true)
    try {
      const method = hasRsvped ? "DELETE" : "POST"
      const res = await fetch(`/api/events/${eventId}/rsvp`, { method })
      const data = await res.json()

      if (!data.error) {
        setHasRsvped(data.hasRsvped)
        setRsvpCount(data.rsvpCount)
      }
    } catch (error) {
      console.error("RSVP error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleRsvp}
        disabled={isLoading}
        className={hasRsvped ? theme.button.secondary : theme.button.primary}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4 mr-2"
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
        ) : hasRsvped ? (
          <svg
            className="w-4 h-4 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ) : null}
        {hasRsvped ? "RSVPed" : "RSVP"}
      </button>
      <span className="text-sm text-theme-muted">
        {rsvpCount} {rsvpCount === 1 ? "person" : "people"} attending
      </span>
    </div>
  )
}
