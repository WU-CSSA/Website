"use client"

import { useState } from "react"
import { theme } from "@/lib/theme"
import type { AnswerValue, FormQuestionDef } from "@/lib/forms"

interface ResponseRow {
  id: string
  createdAt: string | Date
  user: { id: string; displayName: string | null; image: string | null }
  event?: { id: string; title: string } | null
  answers: { questionId: string; value: AnswerValue }[]
}

interface FormResultsProps {
  questions: FormQuestionDef[]
  responses: ResponseRow[]
}

export function FormResults({ questions, responses }: FormResultsProps) {
  const [showIndividual, setShowIndividual] = useState(false)

  if (responses.length === 0) {
    return (
      <div className={`${theme.card.className} p-6`}>
        <p className="text-sm text-theme-muted text-center">No responses yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-theme-muted">
        {responses.length} response{responses.length === 1 ? "" : "s"}
      </p>

      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.id} className={`${theme.card.className} p-4`}>
            <h4 className={`text-sm font-medium ${theme.text.heading} mb-3`}>
              {q.label}
            </h4>
            <QuestionAggregate
              question={q}
              values={responses
                .map((r) => r.answers.find((a) => a.questionId === q.id)?.value)
                .filter((v): v is AnswerValue => v !== undefined)}
            />
          </div>
        ))}
      </div>

      <div>
        <button
          type="button"
          className={theme.button.secondary}
          onClick={() => setShowIndividual((s) => !s)}
        >
          {showIndividual ? "Hide" : "Show"} individual responses
        </button>

        {showIndividual && (
          <div className="mt-4 space-y-4">
            {responses.map((r) => (
              <div key={r.id} className={`${theme.card.className} p-4`}>
                <div className="flex items-center gap-2 mb-3 text-sm text-theme-secondary">
                  <span className="font-medium text-theme-primary">
                    {r.user.displayName || "Anonymous"}
                  </span>
                  <span className="text-theme-muted">
                    {new Date(r.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  {r.event && (
                    <span className="text-theme-muted">· {r.event.title}</span>
                  )}
                </div>
                <dl className="space-y-2">
                  {questions.map((q) => {
                    const a = r.answers.find((x) => x.questionId === q.id)
                    return (
                      <div key={q.id}>
                        <dt className="text-xs text-theme-muted">{q.label}</dt>
                        <dd className="text-sm text-theme-primary">
                          {a ? formatValue(a.value) : "—"}
                        </dd>
                      </div>
                    )
                  })}
                </dl>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatValue(v: AnswerValue): string {
  if (Array.isArray(v)) return v.join(", ")
  if (typeof v === "boolean") return v ? "Yes" : "No"
  return String(v)
}

function QuestionAggregate({
  question,
  values,
}: {
  question: FormQuestionDef
  values: AnswerValue[]
}) {
  if (values.length === 0) {
    return <p className="text-sm text-theme-muted">No answers</p>
  }

  if (question.type === "SHORT_TEXT" || question.type === "LONG_TEXT") {
    return (
      <ul className="space-y-1.5">
        {values.map((v, i) => (
          <li
            key={i}
            className="text-sm text-theme-primary border-l-2 border-theme-border pl-3"
          >
            {String(v)}
          </li>
        ))}
      </ul>
    )
  }

  if (question.type === "RATING") {
    const nums = values.filter((v): v is number => typeof v === "number")
    const avg = nums.reduce((a, b) => a + b, 0) / (nums.length || 1)
    const lo = question.minRating ?? 1
    const hi = question.maxRating ?? 5
    const counts = new Map<number, number>()
    for (let n = lo; n <= hi; n++) counts.set(n, 0)
    nums.forEach((n) => counts.set(n, (counts.get(n) ?? 0) + 1))
    return (
      <div>
        <p className="text-sm text-theme-secondary mb-2">
          Average: <span className="font-medium">{avg.toFixed(2)}</span> (
          {nums.length})
        </p>
        <Bars
          rows={[...counts.entries()].map(([n, c]) => ({
            label: String(n),
            count: c,
          }))}
          total={nums.length}
        />
      </div>
    )
  }

  if (question.type === "BOOLEAN") {
    const yes = values.filter((v) => v === true).length
    const no = values.filter((v) => v === false).length
    return (
      <Bars
        rows={[
          { label: "Yes", count: yes },
          { label: "No", count: no },
        ]}
        total={yes + no}
      />
    )
  }

  // SINGLE_CHOICE / MULTI_CHOICE
  const counts = new Map<string, number>()
  question.options.forEach((o) => counts.set(o, 0))
  const writeIns: string[] = []
  let otherCount = 0
  values.forEach((v) => {
    const picked = Array.isArray(v) ? v : [v]
    picked.forEach((p) => {
      const s = String(p)
      if (counts.has(s)) {
        counts.set(s, (counts.get(s) ?? 0) + 1)
      } else {
        otherCount++
        writeIns.push(s)
      }
    })
  })
  const rows = [...counts.entries()].map(([label, count]) => ({ label, count }))
  if (question.allowOther || otherCount > 0) {
    rows.push({ label: "Other", count: otherCount })
  }
  return (
    <div>
      <Bars rows={rows} total={values.length} />
      {writeIns.length > 0 && (
        <ul className="mt-2 space-y-1">
          {writeIns.map((t, i) => (
            <li
              key={i}
              className="text-xs text-theme-muted border-l-2 border-theme-border pl-2"
            >
              {t}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Bars({
  rows,
  total,
}: {
  rows: { label: string; count: number }[]
  total: number
}) {
  return (
    <div className="space-y-2">
      {rows.map((r) => {
        const pct = total > 0 ? Math.round((r.count / total) * 100) : 0
        return (
          <div key={r.label} className="text-sm">
            <div className="flex justify-between text-theme-secondary mb-0.5">
              <span>{r.label}</span>
              <span className="text-theme-muted">
                {r.count} · {pct}%
              </span>
            </div>
            <div className="h-2 rounded bg-theme-hover overflow-hidden">
              <div
                className="h-full bg-accent rounded"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
