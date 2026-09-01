"use client"

import { useEffect, useState } from "react"
import { theme } from "@/lib/theme"
import type { AnswerValue, FormQuestionDef } from "@/lib/forms"
import { FormResults } from "./form-results"

interface ResultsData {
  form: { id: string; title: string; questions: FormQuestionDef[] }
  responses: {
    id: string
    createdAt: string
    user: { id: string; displayName: string | null; image: string | null }
    event?: { id: string; title: string } | null
    answers: { questionId: string; value: AnswerValue }[]
  }[]
}

export function EventPollResults({
  eventId,
  formId,
}: {
  eventId: string
  formId: string
}) {
  const [data, setData] = useState<ResultsData | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/forms/${formId}/responses?eventId=${eventId}`)
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(setData)
      .catch(() => setError("Failed to load poll results"))
  }, [eventId, formId])

  if (error) {
    return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
  }
  if (!data) {
    return (
      <div className={`${theme.card.className} p-6`}>
        <div className="animate-pulse h-4 w-40 bg-theme-hover rounded" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className={`text-sm font-medium ${theme.text.heading}`}>
        Exit poll: {data.form.title}
      </h3>
      <FormResults
        questions={data.form.questions}
        responses={data.responses}
      />
    </div>
  )
}
