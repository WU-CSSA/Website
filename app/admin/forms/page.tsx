import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { theme } from "@/lib/theme"

export default async function AdminFormsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }
  if (!session.user.isAdmin) {
    redirect("/")
  }

  const forms = await prisma.form.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      published: true,
      updatedAt: true,
      _count: { select: { questions: true, responses: true, events: true } },
    },
  })

  return (
    <div className="min-h-screen bg-theme-bg py-12">
      <div className={theme.container}>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className={`text-3xl ${theme.text.heading}`}>Forms</h1>
            <p className="text-theme-muted mt-2">
              Build exit-poll forms and attach them to events
            </p>
          </div>
          <Link href="/admin/forms/new" className={theme.button.primary}>
            New Form
          </Link>
        </div>

        {forms.length === 0 ? (
          <div className={`${theme.card.className} p-8 text-center`}>
            <p className="text-theme-muted">No forms yet.</p>
          </div>
        ) : (
          <div className={`${theme.card.className} overflow-hidden`}>
            <table className="w-full text-sm">
              <thead className="border-b border-theme-border text-theme-muted">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Title</th>
                  <th className="text-left font-medium px-4 py-3">Questions</th>
                  <th className="text-left font-medium px-4 py-3">Events</th>
                  <th className="text-left font-medium px-4 py-3">Responses</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-left font-medium px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((f) => (
                  <tr
                    key={f.id}
                    className="border-b border-theme-border last:border-0 hover:bg-theme-hover"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/forms/${f.id}`}
                        className="text-accent hover:text-accent-hover font-medium"
                      >
                        {f.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-theme-secondary">
                      {f._count.questions}
                    </td>
                    <td className="px-4 py-3 text-theme-secondary">
                      {f._count.events}
                    </td>
                    <td className="px-4 py-3 text-theme-secondary">
                      {f._count.responses}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          f.published
                            ? "text-green-600 dark:text-green-400"
                            : "text-theme-muted"
                        }
                      >
                        {f.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-theme-muted">
                      {new Date(f.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
