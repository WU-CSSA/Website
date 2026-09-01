"use client"

import { useEffect, useRef, useState } from "react"
import { theme } from "@/lib/theme"
import {
  answersAreComplete,
  type AnswerValue,
  type FormQuestionDef,
} from "@/lib/forms"

export interface RendererChange {
  answers: { questionId: string; value: AnswerValue }[]
  isValid: boolean
}

interface FormRendererProps {
  questions: FormQuestionDef[]
  disabled?: boolean
  fieldErrors?: Record<string, string>
  onChange: (change: RendererChange) => void
}

type ValueMap = Record<string, AnswerValue | undefined>
type StringMap = Record<string, string>
type BoolMap = Record<string, boolean>

// Resolve each question's submitted value, folding in any "Other" write-in.
function computeEffective(
  questions: FormQuestionDef[],
  values: ValueMap,
  otherOn: BoolMap,
  otherText: StringMap
): ValueMap {
  const out: ValueMap = {}
  for (const q of questions) {
    if (q.type === "SINGLE_CHOICE") {
      out[q.id] = otherOn[q.id]
        ? otherText[q.id]?.trim() || undefined
        : (values[q.id] as string | undefined)
    } else if (q.type === "MULTI_CHOICE") {
      const base = Array.isArray(values[q.id]) ? (values[q.id] as string[]) : []
      const write = otherOn[q.id] ? otherText[q.id]?.trim() : ""
      const combined = write ? [...base, write] : base
      out[q.id] = combined.length ? combined : undefined
    } else {
      out[q.id] = values[q.id]
    }
  }
  return out
}

export function FormRenderer({
  questions,
  disabled = false,
  fieldErrors,
  onChange,
}: FormRendererProps) {
  const [values, setValues] = useState<ValueMap>({})
  const [otherOn, setOtherOn] = useState<BoolMap>({})
  const [otherText, setOtherText] = useState<StringMap>({})
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    const effective = computeEffective(questions, values, otherOn, otherText)
    const answers = questions
      .map((q) => ({ questionId: q.id, value: effective[q.id] }))
      .filter(
        (a): a is { questionId: string; value: AnswerValue } =>
          a.value !== undefined &&
          a.value !== null &&
          a.value !== "" &&
          !(Array.isArray(a.value) && a.value.length === 0)
      )
    onChangeRef.current({
      answers,
      isValid: answersAreComplete(questions, effective),
    })
  }, [values, otherOn, otherText, questions])

  const set = (id: string, value: AnswerValue | undefined) =>
    setValues((prev) => ({ ...prev, [id]: value }))
  const toggleOther = (id: string, on: boolean) =>
    setOtherOn((prev) => ({ ...prev, [id]: on }))
  const setText = (id: string, text: string) =>
    setOtherText((prev) => ({ ...prev, [id]: text }))

  return (
    <div className="space-y-5">
      {questions.map((q, i) => {
        const err = fieldErrors?.[q.id]
        return (
          <div key={q.id}>
            <label className={theme.label.className}>
              <span className="text-theme-muted mr-1">{i + 1}.</span>
              {q.label}
              {q.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {q.description && (
              <p className="text-sm text-theme-muted mb-2">{q.description}</p>
            )}

            {(q.type === "SHORT_TEXT" || q.type === "LONG_TEXT") &&
              (q.type === "SHORT_TEXT" ? (
                <input
                  type="text"
                  disabled={disabled}
                  value={(values[q.id] as string) ?? ""}
                  onChange={(e) => set(q.id, e.target.value)}
                  className={theme.input.className}
                />
              ) : (
                <textarea
                  rows={4}
                  disabled={disabled}
                  value={(values[q.id] as string) ?? ""}
                  onChange={(e) => set(q.id, e.target.value)}
                  className={theme.textarea.className}
                />
              ))}

            {q.type === "SINGLE_CHOICE" && (
              <div className="mt-1 space-y-2">
                {q.options.map((opt) => (
                  <label key={opt} className="flex items-center gap-2.5 text-sm">
                    <input
                      type="radio"
                      name={q.id}
                      disabled={disabled}
                      checked={!otherOn[q.id] && values[q.id] === opt}
                      onChange={() => {
                        toggleOther(q.id, false)
                        set(q.id, opt)
                      }}
                      className={theme.checkbox.className}
                    />
                    <span className="text-theme-primary">{opt}</span>
                  </label>
                ))}
                {q.allowOther && (
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2.5 text-sm">
                      <input
                        type="radio"
                        name={q.id}
                        disabled={disabled}
                        checked={!!otherOn[q.id]}
                        onChange={() => {
                          toggleOther(q.id, true)
                          set(q.id, undefined)
                        }}
                        className={theme.checkbox.className}
                      />
                      <span className="text-theme-primary">Other</span>
                    </label>
                    <input
                      type="text"
                      disabled={disabled || !otherOn[q.id]}
                      value={otherText[q.id] ?? ""}
                      onChange={(e) => setText(q.id, e.target.value)}
                      placeholder="Your answer"
                      className={`${theme.input.className} ml-6 w-[calc(100%-1.5rem)]`}
                    />
                  </div>
                )}
              </div>
            )}

            {q.type === "MULTI_CHOICE" && (
              <div className="mt-1 space-y-2">
                {q.options.map((opt) => {
                  const arr = (values[q.id] as string[]) ?? []
                  return (
                    <label
                      key={opt}
                      className="flex items-center gap-2.5 text-sm"
                    >
                      <input
                        type="checkbox"
                        disabled={disabled}
                        checked={arr.includes(opt)}
                        onChange={(e) =>
                          set(
                            q.id,
                            e.target.checked
                              ? [...arr, opt]
                              : arr.filter((o) => o !== opt)
                          )
                        }
                        className={theme.checkbox.className}
                      />
                      <span className="text-theme-primary">{opt}</span>
                    </label>
                  )
                })}
                {q.allowOther && (
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2.5 text-sm">
                      <input
                        type="checkbox"
                        disabled={disabled}
                        checked={!!otherOn[q.id]}
                        onChange={(e) => toggleOther(q.id, e.target.checked)}
                        className={theme.checkbox.className}
                      />
                      <span className="text-theme-primary">Other</span>
                    </label>
                    <input
                      type="text"
                      disabled={disabled || !otherOn[q.id]}
                      value={otherText[q.id] ?? ""}
                      onChange={(e) => setText(q.id, e.target.value)}
                      placeholder="Your answer"
                      className={`${theme.input.className} ml-6 w-[calc(100%-1.5rem)]`}
                    />
                  </div>
                )}
              </div>
            )}

            {q.type === "RATING" && (
              <div className="mt-1 flex flex-wrap gap-2">
                {ratingScale(q.minRating, q.maxRating).map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={disabled}
                    onClick={() => set(q.id, n)}
                    className={`h-10 w-10 rounded-lg border text-sm font-medium transition-colors ${
                      values[q.id] === n
                        ? "border-accent bg-accent text-white"
                        : "border-theme-border bg-theme-input text-theme-primary hover:bg-theme-hover"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}

            {q.type === "BOOLEAN" && (
              <div className="mt-1 flex gap-2">
                {[
                  { label: "Yes", val: true },
                  { label: "No", val: false },
                ].map(({ label, val }) => (
                  <button
                    key={label}
                    type="button"
                    disabled={disabled}
                    onClick={() => set(q.id, val)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      values[q.id] === val
                        ? "border-accent bg-accent text-white"
                        : "border-theme-border bg-theme-input text-theme-primary hover:bg-theme-hover"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {err && <p className="mt-1.5 text-sm text-red-500">{err}</p>}
          </div>
        )
      })}
    </div>
  )
}

function ratingScale(min: number | null, max: number | null): number[] {
  const lo = min ?? 1
  const hi = max ?? 5
  const out: number[] = []
  for (let n = lo; n <= hi; n++) out.push(n)
  return out
}
