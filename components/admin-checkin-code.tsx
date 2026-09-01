"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { theme } from "@/lib/theme"

interface AdminCheckinCodeProps {
  eventId: string
}

export function AdminCheckinCode({ eventId }: AdminCheckinCodeProps) {
  const router = useRouter()
  const [code, setCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/events/${eventId}/code`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setCode(data.code)
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [eventId])

  const generateCode = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch(`/api/events/${eventId}/code`, { method: "POST" })
      const data = await res.json()
      if (!data.error) {
        setCode(data.code)
        router.refresh()
      }
    } catch (error) {
      console.error("Generate code error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const removeCode = async () => {
    setIsRemoving(true)
    try {
      const res = await fetch(`/api/events/${eventId}/code`, { method: "DELETE" })
      const data = await res.json()
      if (!data.error) {
        setCode(null)
        setConfirmRemove(false)
        router.refresh()
      }
    } catch (error) {
      console.error("Remove code error:", error)
    } finally {
      setIsRemoving(false)
    }
  }

  const copyCode = async () => {
    if (code) {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className={`${theme.card.className} p-6`}>
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-4 w-32 bg-theme-hover rounded" />
          <div className="h-16 w-48 bg-theme-hover rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className={`${theme.card.className} p-6`}>
      <h3 className={`text-sm font-medium ${theme.text.heading} mb-4 text-center`}>
        Check-in Code
      </h3>

      {code ? (
        <div className="flex flex-col items-center gap-4">
          <div className="text-5xl font-mono font-bold tracking-[0.3em] text-accent">
            {code}
          </div>
          <p className="text-sm text-theme-muted text-center">
            Share this code with attendees to check in
          </p>
          <div className="flex gap-2">
            <button
              onClick={copyCode}
              className={theme.button.secondary}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copy
                </>
              )}
            </button>
            <button
              onClick={generateCode}
              disabled={isGenerating}
              className={theme.button.secondary}
            >
              {isGenerating ? (
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
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  New Code
                </>
              )}
            </button>
          </div>

          {confirmRemove ? (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-theme-muted">
                Remove code and stop check-in?
              </span>
              <button
                onClick={removeCode}
                disabled={isRemoving}
                className="font-medium text-red-600 hover:underline dark:text-red-400 disabled:opacity-50"
              >
                {isRemoving ? "Removing…" : "Remove"}
              </button>
              <button
                onClick={() => setConfirmRemove(false)}
                disabled={isRemoving}
                className="text-theme-muted hover:underline"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmRemove(true)}
              className={theme.button.ghost}
            >
              Remove code
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-theme-muted text-center">
            Generate a check-in code for attendees
          </p>
          <button
            onClick={generateCode}
            disabled={isGenerating}
            className={theme.button.primary}
          >
            {isGenerating ? (
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
            ) : null}
            Generate Check-in Code
          </button>
        </div>
      )}
    </div>
  )
}
