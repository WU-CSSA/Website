import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { theme } from "@/lib/theme"
import { FormBuilder } from "@/components/form-builder"

export default async function EditFormPage({
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
    include: { questions: { orderBy: { order: "asc" } } },
  })

  if (!form) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-theme-bg py-12">
      <div className={`${theme.container} max-w-3xl`}>
        <h1 className={`text-3xl ${theme.text.heading} mb-8`}>Edit Form</h1>
        <FormBuilder
          initialForm={{
            id: form.id,
            title: form.title,
            description: form.description,
            published: form.published,
            questions: form.questions,
          }}
        />
      </div>
    </div>
  )
}
