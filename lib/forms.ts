// Shared form/exit-poll types and validation. Kept free of server-only imports
// (no "@prisma/client") so both API routes and client components can use it.

export type FormQuestionType =
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "SINGLE_CHOICE"
  | "MULTI_CHOICE"
  | "RATING"
  | "BOOLEAN"

export const FORM_QUESTION_TYPES: FormQuestionType[] = [
  "SHORT_TEXT",
  "LONG_TEXT",
  "SINGLE_CHOICE",
  "MULTI_CHOICE",
  "RATING",
  "BOOLEAN",
]

export const QUESTION_TYPE_LABELS: Record<FormQuestionType, string> = {
  SHORT_TEXT: "Short text",
  LONG_TEXT: "Long text",
  SINGLE_CHOICE: "Single choice",
  MULTI_CHOICE: "Multiple choice",
  RATING: "Rating scale",
  BOOLEAN: "Yes / No",
}

export const CHOICE_TYPES: FormQuestionType[] = ["SINGLE_CHOICE", "MULTI_CHOICE"]

export const SHORT_TEXT_MAX = 500
export const LONG_TEXT_MAX = 5000

export function isChoiceType(type: FormQuestionType): boolean {
  return CHOICE_TYPES.includes(type)
}

// ---------------------------------------------------------------------------
// Question definitions (form builder -> API)
// ---------------------------------------------------------------------------

export interface QuestionInput {
  id?: unknown
  type?: unknown
  label?: unknown
  description?: unknown
  required?: unknown
  options?: unknown
  allowOther?: unknown
  minRating?: unknown
  maxRating?: unknown
}

export interface NormalizedQuestion {
  id?: string
  order: number
  type: FormQuestionType
  label: string
  description: string | null
  required: boolean
  options: string[]
  allowOther: boolean
  minRating: number | null
  maxRating: number | null
}

/**
 * Validate + normalize an incoming question list from the form builder.
 * Returns `{ questions }` on success or `{ error }` with a human-readable message.
 */
export type NormalizeResult =
  | { ok: true; questions: NormalizedQuestion[] }
  | { ok: false; error: string }

export function normalizeQuestions(raw: unknown): NormalizeResult {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, error: "A form needs at least one question" }
  }

  const questions: NormalizedQuestion[] = []

  for (let i = 0; i < raw.length; i++) {
    const q = (raw[i] ?? {}) as QuestionInput
    const label = typeof q.label === "string" ? q.label.trim() : ""
    if (!label) {
      return { ok: false, error: `Question ${i + 1} is missing a label` }
    }
    if (!FORM_QUESTION_TYPES.includes(q.type as FormQuestionType)) {
      return { ok: false, error: `Question ${i + 1} has an invalid type` }
    }
    const type = q.type as FormQuestionType

    let options: string[] = []
    if (isChoiceType(type)) {
      options = Array.isArray(q.options)
        ? q.options.map((o) => String(o).trim()).filter(Boolean)
        : []
      if (options.length < 2) {
        return { ok: false, error: `"${label}" needs at least two options` }
      }
      if (new Set(options).size !== options.length) {
        return { ok: false, error: `"${label}" has duplicate options` }
      }
    }

    let minRating: number | null = null
    let maxRating: number | null = null
    if (type === "RATING") {
      minRating = Number.isFinite(Number(q.minRating))
        ? Math.trunc(Number(q.minRating))
        : 1
      maxRating = Number.isFinite(Number(q.maxRating))
        ? Math.trunc(Number(q.maxRating))
        : 5
      if (minRating >= maxRating) {
        return {
          ok: false,
          error: `"${label}" needs a rating range where min is less than max`,
        }
      }
      if (maxRating - minRating > 20) {
        return { ok: false, error: `"${label}" rating range is too large (max span is 20)` }
      }
    }

    questions.push({
      id: typeof q.id === "string" && q.id ? q.id : undefined,
      order: i,
      type,
      label,
      description:
        typeof q.description === "string" && q.description.trim()
          ? q.description.trim()
          : null,
      required: q.required !== false,
      options,
      allowOther: isChoiceType(type) && q.allowOther === true,
      minRating,
      maxRating,
    })
  }

  return { ok: true, questions }
}

/**
 * A fully-resolved question as stored/returned by the API. Structurally
 * compatible with Prisma's `FormQuestion` rows.
 */
export interface FormQuestionDef {
  id: string
  order: number
  type: FormQuestionType
  label: string
  description: string | null
  required: boolean
  options: string[]
  allowOther: boolean
  minRating: number | null
  maxRating: number | null
}

// ---------------------------------------------------------------------------
// Answers (check-in / form renderer -> API)
// ---------------------------------------------------------------------------

export interface QuestionForValidation {
  id: string
  type: FormQuestionType
  label: string
  required: boolean
  options: string[]
  allowOther: boolean
  minRating: number | null
  maxRating: number | null
}

export type AnswerValue = string | string[] | number | boolean

/** Max length of a free-text "Other" write-in on a choice question. */
export const OTHER_TEXT_MAX = SHORT_TEXT_MAX

/** True when `value` is a write-in, i.e. not one of the question's options. */
export function isOtherValue(value: string, options: string[]): boolean {
  return !options.includes(value)
}

export interface ValidatedAnswer {
  questionId: string
  value: AnswerValue
}

/**
 * Validate a set of submitted answers against a form's questions.
 * Returns `{ answers }` (only questions that were answered) on success, or
 * `{ errors }` mapping questionId -> message when anything is invalid or a
 * required question is missing.
 */
export function validateAnswers(
  questions: QuestionForValidation[],
  rawAnswers: unknown
):
  | { answers: ValidatedAnswer[]; errors?: undefined }
  | { errors: Record<string, string>; answers?: undefined } {
  const list = Array.isArray(rawAnswers) ? rawAnswers : []
  const byId = new Map<string, unknown>()
  for (const a of list) {
    const entry = a as { questionId?: unknown; value?: unknown }
    if (entry && typeof entry.questionId === "string") {
      byId.set(entry.questionId, entry.value)
    }
  }

  const errors: Record<string, string> = {}
  const answers: ValidatedAnswer[] = []
  const requiredMsg = "This question is required"

  for (const q of questions) {
    const raw = byId.get(q.id)
    const missing = raw === undefined || raw === null || raw === ""

    if (missing) {
      if (q.required) errors[q.id] = requiredMsg
      continue
    }

    switch (q.type) {
      case "SHORT_TEXT":
      case "LONG_TEXT": {
        if (typeof raw !== "string" || !raw.trim()) {
          if (q.required) errors[q.id] = requiredMsg
          break
        }
        const max = q.type === "SHORT_TEXT" ? SHORT_TEXT_MAX : LONG_TEXT_MAX
        if (raw.length > max) {
          errors[q.id] = `Answer must be ${max} characters or fewer`
          break
        }
        answers.push({ questionId: q.id, value: raw.trim() })
        break
      }
      case "SINGLE_CHOICE": {
        if (typeof raw !== "string") {
          errors[q.id] = "Select one of the provided options"
          break
        }
        if (!q.options.includes(raw)) {
          if (!q.allowOther || !raw.trim()) {
            errors[q.id] = "Select one of the provided options"
            break
          }
          if (raw.length > OTHER_TEXT_MAX) {
            errors[q.id] = `Answer must be ${OTHER_TEXT_MAX} characters or fewer`
            break
          }
          answers.push({ questionId: q.id, value: raw.trim() })
          break
        }
        answers.push({ questionId: q.id, value: raw })
        break
      }
      case "MULTI_CHOICE": {
        const arr = Array.isArray(raw) ? raw.map((v) => String(v)) : []
        if (arr.length === 0) {
          if (q.required) errors[q.id] = "Select at least one option"
          break
        }
        if (new Set(arr).size !== arr.length) {
          errors[q.id] = "Invalid option selected"
          break
        }
        const others = arr.filter((v) => !q.options.includes(v))
        if (others.length > 0) {
          if (!q.allowOther) {
            errors[q.id] = "Invalid option selected"
            break
          }
          if (others.length > 1) {
            errors[q.id] = "Only one 'Other' write-in is allowed"
            break
          }
          if (!others[0].trim() || others[0].length > OTHER_TEXT_MAX) {
            errors[q.id] = `Write-in must be 1–${OTHER_TEXT_MAX} characters`
            break
          }
        }
        answers.push({
          questionId: q.id,
          value: arr.map((v) => (q.options.includes(v) ? v : v.trim())),
        })
        break
      }
      case "RATING": {
        const num = typeof raw === "number" ? raw : Number(raw)
        const min = q.minRating ?? 1
        const max = q.maxRating ?? 5
        if (!Number.isInteger(num) || num < min || num > max) {
          errors[q.id] = `Choose a rating between ${min} and ${max}`
          break
        }
        answers.push({ questionId: q.id, value: num })
        break
      }
      case "BOOLEAN": {
        if (typeof raw !== "boolean") {
          errors[q.id] = requiredMsg
          break
        }
        answers.push({ questionId: q.id, value: raw })
        break
      }
    }
  }

  if (Object.keys(errors).length > 0) return { errors }
  return { answers }
}

/**
 * Lightweight client-side check that every required question has a usable
 * answer. Mirrors (loosely) the server rules in `validateAnswers` so the
 * check-in button can enable/disable without a round trip.
 */
export function answersAreComplete(
  questions: Pick<FormQuestionDef, "id" | "type" | "required">[],
  values: Record<string, AnswerValue | undefined>
): boolean {
  return questions.every((q) => {
    if (!q.required) return true
    const v = values[q.id]
    if (v === undefined || v === null || v === "") return false
    if (Array.isArray(v)) return v.length > 0
    return true
  })
}
