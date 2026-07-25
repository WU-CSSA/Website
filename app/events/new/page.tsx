import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { CreateEventForm } from "./create-event-form"
import { theme } from "@/lib/theme"

export default async function NewEventPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-theme-bg">
      <div className={`${theme.container} ${theme.section}`}>
        <div className={`${theme.card.className} max-w-4xl mx-auto p-8`}>
          <h1 className={`text-3xl ${theme.text.heading} mb-2`}>Create New Event</h1>
          <p className={`${theme.text.muted} mb-8`}>Fill in the details below to create a new event</p>
          <CreateEventForm userId={session.user.id} />
        </div>
      </div>
    </div>
  )
}
