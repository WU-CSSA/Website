import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { theme } from "@/lib/theme"
import { QUESTION_TYPE_LABELS, type AnswerValue } from "@/lib/forms"
import { FormResults } from "@/components/form-results"
import { DeleteFormButton } from "@/components/delete-form-button"

export default async function FormDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }
  if (!session.user.isAdmin) {
    redirect("/")
  }

  const { id } = await params
  const form = await prisma.form.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" } },
      events: {
        select: { id: true, title: true, startDate: true },
        orderBy: { startDate: "desc" },
      },
      responses: {
        orderBy: { createdAt: "desc" },
        include: {
          answers: { select: { questionId: true, value: true } },
          user: { select: { id: true, displayName: true, name: true, image: true } },
          event: { select: { id: true, title: true } },
        },
      },
    },
  })

  if (!form) {
    notFound()
  }

  const responses = form.responses.map((r) => ({
    id: r.id,
    createdAt: r.createdAt.toISOString(),
    user: {
      id: r.user.id,
      displayName: r.user.displayName || r.user.name,
      image: r.user.image,
    },
    event: r.event,
    answers: r.answers.map((a) => ({
      questionId: a.questionId,
      value: a.value as AnswerValue,
    })),
  }))

  return (
    <div className="min-h-screen bg-theme-bg py-12">
      <div className={`${theme.container} max-w-3xl space-y-8`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link
              href="/admin/forms"
              className="text-sm text-theme-muted hover:text-theme-primary"
            >
              ← All forms
            </Link>
            <h1 className={`text-3xl ${theme.text.heading} mt-2`}>{form.title}</h1>
            {form.description && (
              <p className="text-theme-secondary mt-2">{form.description}</p>
            )}
            {!form.published && (
              <span className="text-sm text-theme-muted">Draft</span>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              href={`/admin/forms/${form.id}/edit`}
              className={theme.button.secondary}
            >
              Edit
            </Link>
            <DeleteFormButton id={form.id} />
          </div>
        </div>

        <section>
          <h2 className={`text-lg ${theme.text.heading} mb-3`}>Questions</h2>
          <ol className={`${theme.card.className} divide-y divide-theme-border`}>
            {form.questions.map((q, i) => (
              <li key={q.id} className="p-4">
                <div className="flex justify-between gap-3">
                  <span className="text-sm text-theme-primary">
                    {i + 1}. {q.label}
                    {q.required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                  <span className="text-xs text-theme-muted shrink-0">
                    {QUESTION_TYPE_LABELS[q.type]}
                  </span>
                </div>
                {q.options.length > 0 && (
                  <p className="text-xs text-theme-muted mt-1">
                    {q.options.join(" · ")}
                    {q.allowOther && " · Other (write-in)"}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>

        {form.events.length > 0 && (
          <section>
            <h2 className={`text-lg ${theme.text.heading} mb-3`}>
              Attached to events
            </h2>
            <ul className="space-y-1.5">
              {form.events.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/events/${e.id}`}
                    className="text-sm text-accent hover:text-accent-hover"
                  >
                    {e.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className={`text-lg ${theme.text.heading} mb-3`}>Results</h2>
          <FormResults questions={form.questions} responses={responses} />
        </section>
      </div>
    </div>
  )
}
