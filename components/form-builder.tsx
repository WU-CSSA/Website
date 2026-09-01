"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input, Textarea, Button, Checkbox, Select } from "@/components/ui"
import { theme } from "@/lib/theme"
import {
  FORM_QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
  isChoiceType,
  type FormQuestionDef,
  type FormQuestionType,
} from "@/lib/forms"

interface BuilderQuestion {
  key: string
  id?: string
  type: FormQuestionType
  label: string
  description: string
  required: boolean
  options: string[]
  allowOther: boolean
  minRating: number
  maxRating: number
}

export interface BuilderInitialForm {
  id: string
  title: string
  description: string | null
  published: boolean
  questions: FormQuestionDef[]
}

function newKey() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
}

function blankQuestion(): BuilderQuestion {
  return {
    key: newKey(),
    type: "SHORT_TEXT",
    label: "",
    description: "",
    required: true,
    options: ["", ""],
    allowOther: false,
    minRating: 1,
    maxRating: 5,
  }
}

function fromDef(q: FormQuestionDef): BuilderQuestion {
  return {
    key: newKey(),
    id: q.id,
    type: q.type,
    label: q.label,
    description: q.description ?? "",
    required: q.required,
    options: q.options.length ? q.options : ["", ""],
    allowOther: q.allowOther,
    minRating: q.minRating ?? 1,
    maxRating: q.maxRating ?? 5,
  }
}

export function FormBuilder({
  initialForm,
}: {
  initialForm?: BuilderInitialForm
}) {
  const router = useRouter()
  const editing = !!initialForm

  const [title, setTitle] = useState(initialForm?.title ?? "")
  const [description, setDescription] = useState(initialForm?.description ?? "")
  const [published, setPublished] = useState(initialForm?.published ?? true)
  const [questions, setQuestions] = useState<BuilderQuestion[]>(
    initialForm?.questions.length
      ? initialForm.questions.map(fromDef)
      : [blankQuestion()]
  )
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const patch = (key: string, next: Partial<BuilderQuestion>) =>
    setQuestions((qs) =>
      qs.map((q) => (q.key === key ? { ...q, ...next } : q))
    )

  const move = (key: string, dir: -1 | 1) =>
    setQuestions((qs) => {
      const i = qs.findIndex((q) => q.key === key)
      const j = i + dir
      if (i < 0 || j < 0 || j >= qs.length) return qs
      const copy = [...qs]
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
      return copy
    })

  const remove = (key: string) =>
    setQuestions((qs) => (qs.length > 1 ? qs.filter((q) => q.key !== key) : qs))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const payload = {
      title,
      description: description || null,
      published,
      questions: questions.map((q) => ({
        id: q.id,
        type: q.type,
        label: q.label,
        description: q.description || null,
        required: q.required,
        options: isChoiceType(q.type)
          ? q.options.map((o) => o.trim()).filter(Boolean)
          : [],
        allowOther: isChoiceType(q.type) ? q.allowOther : false,
        minRating: q.type === "RATING" ? q.minRating : null,
        maxRating: q.type === "RATING" ? q.maxRating : null,
      })),
    }

    try {
      const res = await fetch(
        editing ? `/api/forms/${initialForm!.id}` : "/api/forms",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to save form")
        return
      }
      router.push(
        editing ? `/admin/forms/${initialForm!.id}` : `/admin/forms/${data.form.id}`
      )
      router.refresh()
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm dark:bg-red-950/40">
          {error}
        </div>
      )}

      <Input
        id="title"
        label="Form Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <Textarea
        id="description"
        label="Description (Optional)"
        rows={2}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Shown to attendees above the questions"
      />

      <Checkbox
        id="published"
        label="Published (available to attach to events)"
        checked={published}
        onChange={(e) => setPublished(e.target.checked)}
      />

      <div className="space-y-4">
        <h2 className={`text-lg ${theme.text.heading}`}>Questions</h2>
        {questions.map((q, i) => (
          <div
            key={q.key}
            className={`${theme.card.className} p-4 space-y-3`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-theme-muted">
                Question {i + 1}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(q.key, -1)}
                  disabled={i === 0}
                  className={theme.button.ghost}
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(q.key, 1)}
                  disabled={i === questions.length - 1}
                  className={theme.button.ghost}
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(q.key)}
                  disabled={questions.length === 1}
                  className={theme.button.ghost}
                  aria-label="Remove question"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                id={`label-${q.key}`}
                label="Question"
                value={q.label}
                onChange={(e) => patch(q.key, { label: e.target.value })}
                required
              />
              <Select
                id={`type-${q.key}`}
                label="Type"
                value={q.type}
                onChange={(e) =>
                  patch(q.key, { type: e.target.value as FormQuestionType })
                }
              >
                {FORM_QUESTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {QUESTION_TYPE_LABELS[t]}
                  </option>
                ))}
              </Select>
            </div>

            <Input
              id={`desc-${q.key}`}
              label="Help text (Optional)"
              value={q.description}
              onChange={(e) => patch(q.key, { description: e.target.value })}
            />

            {isChoiceType(q.type) && (
              <div className="space-y-2">
                <label className={theme.label.className}>Options</label>
                {q.options.map((opt, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      className={theme.input.className}
                      value={opt}
                      placeholder={`Option ${idx + 1}`}
                      onChange={(e) =>
                        patch(q.key, {
                          options: q.options.map((o, k) =>
                            k === idx ? e.target.value : o
                          ),
                        })
                      }
                    />
                    <button
                      type="button"
                      className={theme.button.ghost}
                      onClick={() =>
                        patch(q.key, {
                          options: q.options.filter((_, k) => k !== idx),
                        })
                      }
                      disabled={q.options.length <= 2}
                      aria-label="Remove option"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className={theme.button.secondary}
                  onClick={() =>
                    patch(q.key, { options: [...q.options, ""] })
                  }
                >
                  Add option
                </button>
                <Checkbox
                  id={`other-${q.key}`}
                  label={'Allow an "Other" write-in option'}
                  checked={q.allowOther}
                  onChange={(e) =>
                    patch(q.key, { allowOther: e.target.checked })
                  }
                />
              </div>
            )}

            {q.type === "RATING" && (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id={`min-${q.key}`}
                  type="number"
                  label="Min"
                  value={q.minRating}
                  onChange={(e) =>
                    patch(q.key, { minRating: Number(e.target.value) })
                  }
                />
                <Input
                  id={`max-${q.key}`}
                  type="number"
                  label="Max"
                  value={q.maxRating}
                  onChange={(e) =>
                    patch(q.key, { maxRating: Number(e.target.value) })
                  }
                />
              </div>
            )}

            <Checkbox
              id={`req-${q.key}`}
              label="Required"
              checked={q.required}
              onChange={(e) => patch(q.key, { required: e.target.checked })}
            />
          </div>
        ))}

        <button
          type="button"
          className={theme.button.secondary}
          onClick={() => setQuestions((qs) => [...qs, blankQuestion()])}
        >
          Add question
        </button>
      </div>

      <div className="flex gap-4">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          {editing ? "Save Form" : "Create Form"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
