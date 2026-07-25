import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EditEventForm } from "./edit-event-form"
import { theme } from "@/lib/theme"

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const { id } = await params

  const event = await prisma.event.findUnique({
    where: { id },
  })

  if (!event) {
    notFound()
  }

  if (event.authorId !== session.user.id) {
    redirect("/events")
  }

  return (
    <div className="min-h-screen bg-theme-bg">
      <div className={`${theme.container} ${theme.section}`}>
        <div className={`${theme.card.className} max-w-4xl mx-auto p-8`}>
          <h1 className={`text-3xl ${theme.text.heading} mb-2`}>Edit Event</h1>
          <p className={`${theme.text.muted} mb-8`}>Update your event details</p>
          <EditEventForm event={event} />
        </div>
      </div>
    </div>
  )
}
