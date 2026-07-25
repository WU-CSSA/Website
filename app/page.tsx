import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { theme } from "@/lib/theme"
import { ContributionGraph } from "@/components/contribution-graph"
import { FeaturedProjects } from "@/components/featured-projects"

export default async function Home() {
  const recentPosts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { author: true },
  })

  const upcomingEvents = await prisma.event.findMany({
    where: {
      published: true,
      startDate: { gte: new Date() },
    },
    orderBy: { startDate: "asc" },
    take: 3,
  })

  const featuredProjects = await prisma.project.findMany({
    where: { published: true, featured: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  return (
    <div className="min-h-screen bg-theme-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10" />
        <div className={`${theme.container} relative py-20 md:py-28`}>
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              Welcome to CSSA
            </div>
            <h1 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl ${theme.text.heading} leading-tight`}>
              Computer Science
              <span className="block text-accent">Student Association</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-theme-secondary max-w-2xl mx-auto leading-relaxed">
              Join us in exploring the exciting world of computer science. Connect with fellow students,
              attend events, and build your skills together.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/calendar"
                className={theme.button.primary + " px-8 py-3 text-base"}
              >
                View Events
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/posts"
                className={theme.button.secondary + " px-8 py-3 text-base"}
              >
                Read Posts
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className={theme.section}>
          <div className={theme.container}>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className={`text-3xl ${theme.text.heading}`}>Featured Projects</h2>
                <p className={`mt-2 ${theme.text.muted}`}>Showcasing work from our community</p>
              </div>
              <Link
                href="/projects"
                className="text-accent hover:text-accent-hover font-medium flex items-center gap-1 transition-colors"
              >
                View all projects
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <FeaturedProjects projects={featuredProjects} />
          </div>
        </section>
      )}

      {/* GitHub Activity */}
      <section className={theme.section}>
        <div className={theme.container}>
          <ContributionGraph />
        </div>
      </section>

      {/* Upcoming Events */}
      <section className={theme.section}>
        <div className={theme.container}>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className={`text-3xl ${theme.text.heading}`}>Upcoming Events</h2>
              <p className={`mt-2 ${theme.text.muted}`}>Don&apos;t miss out on what&apos;s happening</p>
            </div>
            <Link
              href="/calendar"
              className="text-accent hover:text-accent-hover font-medium flex items-center gap-1 transition-colors"
            >
              View all
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className={`${theme.card.className} p-6 hover:border-accent/50 hover:shadow-lg transition-all duration-300 group`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-accent/10 text-accent">
                      <span className="text-xs font-medium uppercase">
                        {new Date(event.startDate).toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-xl font-bold leading-none">
                        {new Date(event.startDate).getDate()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${theme.text.heading} group-hover:text-accent transition-colors`}>
                        {event.title}
                      </h3>
                    </div>
                  </div>
                  <p className="text-theme-secondary line-clamp-2 text-sm">{event.description}</p>
                  {event.location && (
                    <div className="mt-4 pt-4 border-t border-theme-border flex items-center gap-2 text-sm text-theme-muted">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className={`${theme.card.className} p-12 text-center`}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-theme-hover flex items-center justify-center">
                <svg className="w-8 h-8 text-theme-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-theme-muted">No upcoming events. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Posts */}
      <section className={`${theme.section} bg-theme-card`}>
        <div className={theme.container}>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className={`text-3xl ${theme.text.heading}`}>Recent Posts</h2>
              <p className={`mt-2 ${theme.text.muted}`}>Latest updates from the community</p>
            </div>
            <Link
              href="/posts"
              className="text-accent hover:text-accent-hover font-medium flex items-center gap-1 transition-colors"
            >
              View all
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          {recentPosts.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-theme-bg rounded-xl border border-theme-border p-6 hover:border-accent/50 hover:shadow-lg transition-all duration-300 group"
                >
                  <Link href={`/posts/${post.id}`}>
                    <h3 className={`text-xl font-semibold ${theme.text.heading} group-hover:text-accent transition-colors line-clamp-2`}>
                      {post.title}
                    </h3>
                  </Link>
                  <p className="mt-3 text-theme-secondary line-clamp-3 text-sm leading-relaxed">
                    {post.description || post.content.substring(0, 150) + "..."}
                  </p>
                  <div className="mt-4 pt-4 border-t border-theme-border flex items-center gap-3">
                    {post.author.image ? (
                      <img
                        src={post.author.image}
                        alt={post.author.displayName || post.author.name || "User"}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-medium text-sm">
                        {(post.author.displayName || post.author.name || post.author.email || "U")[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-theme-primary truncate">
                        {post.author.displayName || post.author.name || post.author.email}
                      </p>
                      <p className="text-xs text-theme-muted">
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-theme-bg rounded-xl border border-theme-border p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-theme-hover flex items-center justify-center">
                <svg className="w-8 h-8 text-theme-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <p className="text-theme-muted">No posts yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
