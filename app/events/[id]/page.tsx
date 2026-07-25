import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { DeleteButton } from "@/components/delete-button"
import { MarkdownContent } from "@/components/markdown-content"
import { theme } from "@/lib/theme"

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  const { id } = await params

  const event = await prisma.event.findUnique({
    where: { id },
    include: { author: true },
  })

  if (!event || !event.published) {
    notFound()
  }

  const isAuthor = session?.user?.id === event.authorId

  return (
    <div className="min-h-screen bg-theme-bg">
      <article className={`${theme.container} ${theme.section}`}>
        <div className={`${theme.card.className} max-w-4xl mx-auto p-8`}>
          {/* Header */}
          <header className="mb-8 border-b border-theme-border pb-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className={`text-3xl md:text-4xl ${theme.text.heading} flex-1`}>
                {event.title}
              </h1>
              {isAuthor && (
                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/events/${event.id}/edit`}
                    className={theme.button.secondary}
                  >
                    Edit
                  </Link>
                  <DeleteButton id={event.id} type="event" redirectTo="/calendar" />
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-theme-muted">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <time>
                  {new Date(event.startDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {" at "}
                  {new Date(event.startDate).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </time>
              </div>

              {event.location && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{event.location}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Posted by {event.author.displayName || event.author.name || event.author.email}</span>
              </div>
            </div>

            {event.description && (
              <p className="mt-4 text-lg text-theme-secondary italic">
                {event.description}
              </p>
            )}
          </header>

          {/* Markdown Content */}
          <MarkdownContent content={event.content} />
        </div>
      </article>
    </div>
  )
}
