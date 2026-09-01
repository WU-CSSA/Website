"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { theme } from "@/lib/theme"

interface FormOption {
  id: string
  title: string
  published: boolean
  _count: { questions: number }
}

interface EventFormManagerProps {
  eventId: string
}

export function EventFormManager({ eventId }: EventFormManagerProps) {
  const { data: session } = useSession()
  const [forms, setForms] = useState<FormOption[]>([])
  const [formId, setFormId] = useState("")
  const [required, setRequired] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    Promise.all([
      fetch("/api/forms").then((r) => (r.ok ? r.json() : { forms: [] })),
      fetch(`/api/events/${eventId}/form`).then((r) =>
        r.ok ? r.json() : { form: null, required: true }
      ),
    ])
      .then(([formsRes, current]) => {
        setForms(formsRes.forms ?? [])
        setFormId(current.form?.id ?? "")
        setRequired(current.required ?? true)
      })
      .catch(() => setError("Failed to load forms"))
      .finally(() => setLoading(false))
  }, [eventId])

  async function save() {
    setSaving(true)
    setError("")
    try {
      const res = await fetch(`/api/events/${eventId}/form`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId: formId || null, required }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to save")
        return
      }
      setSavedAt(Date.now())
      setTimeout(() => setSavedAt(null), 2000)
    } catch {
      setError("An error occurred")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={`${theme.card.className} p-6`}>
        <div className="animate-pulse h-4 w-40 bg-theme-hover rounded" />
      </div>
    )
  }

  const publishedForms = forms.filter((f) => f.published || f.id === formId)

  return (
    <div className={`${theme.card.className} p-6 space-y-4`}>
      <h3 className={`text-sm font-medium ${theme.text.heading}`}>
        Exit Poll
      </h3>

      {forms.length === 0 ? (
        <p className="text-sm text-theme-muted">
          No forms exist yet.{" "}
          <Link
            href="/admin/forms/new"
            className="text-accent hover:text-accent-hover"
          >
            Create one
          </Link>
          .
        </p>
      ) : (
        <>
          <div>
            <label htmlFor="event-form" className={theme.label.className}>
              Form attendees must complete to check in
            </label>
            <select
              id="event-form"
              value={formId}
              onChange={(e) => setFormId(e.target.value)}
              className={theme.select.className}
            >
              <option value="">None</option>
              {publishedForms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title} ({f._count.questions} question
                  {f._count.questions === 1 ? "" : "s"})
                </option>
              ))}
            </select>
          </div>

          {formId && (
            <label className="flex items-center gap-2.5 text-sm">
              <input
                type="checkbox"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
                className={theme.checkbox.className}
              />
              <span className="text-theme-secondary">
                Required — block check-in until the poll is completed
              </span>
            </label>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className={theme.button.primary}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            {savedAt && (
              <span className="text-sm text-green-600 dark:text-green-400">
                Saved
              </span>
            )}
            {formId && session?.user?.isAdmin && (
              <Link
                href={`/admin/forms/${formId}`}
                className="text-sm text-accent hover:text-accent-hover"
              >
                View results
              </Link>
            )}
          </div>
        </>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
}
