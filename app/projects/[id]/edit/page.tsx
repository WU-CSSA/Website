import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EditProjectForm } from "./edit-project-form"
import { theme } from "@/lib/theme"
import { loginHref } from "@/lib/login-url"

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  const { id } = await params

  if (!session?.user) {
    redirect(loginHref(`/projects/${id}/edit`))
  }

  const project = await prisma.project.findUnique({
    where: { id },
  })

  if (!project) {
    notFound()
  }

  if (project.authorId !== session.user.id) {
    redirect(`/projects/${id}`)
  }

  return (
    <div className="min-h-screen bg-theme-bg">
      <div className={`${theme.container} ${theme.section}`}>
        <div className={`${theme.card.className} max-w-3xl mx-auto p-8`}>
          <h1 className={`text-3xl ${theme.text.heading} mb-6`}>Edit Project</h1>
          <EditProjectForm project={project} />
        </div>
      </div>
    </div>
  )
}
