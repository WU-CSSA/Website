import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { CreateProjectForm } from "./create-project-form"
import { theme } from "@/lib/theme"

export default async function NewProjectPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (!session.user.isAdmin) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-theme-bg">
      <div className={`${theme.container} ${theme.section}`}>
        <div className={`${theme.card.className} max-w-3xl mx-auto p-8`}>
          <h1 className={`text-3xl ${theme.text.heading} mb-6`}>Create New Project</h1>
          <CreateProjectForm userId={session.user.id} />
        </div>
      </div>
    </div>
  )
}
