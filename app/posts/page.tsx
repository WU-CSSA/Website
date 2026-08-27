import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { theme } from "@/lib/theme"

export default async function PostsPage() {
  const session = await auth()

  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: { author: true },
  })

  return (
    <div className="min-h-screen bg-theme-bg">
      <div className={`${theme.container} ${theme.section}`}>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h1 className={`text-4xl ${theme.text.heading}`}>Posts</h1>
              <p className={`mt-2 ${theme.text.muted}`}>News and updates from the community</p>
            </div>
            {session?.user?.isAdmin && (
              <Link href="/posts/new" className={theme.button.primary}>
                New Post
              </Link>
            )}
          </div>

          {posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className={`${theme.card.className} p-8 hover:border-accent/50 hover:shadow-lg transition-all duration-300 group`}
                >
                  <Link href={`/posts/${post.id}`}>
                    <h2 className={`text-2xl font-bold ${theme.text.heading} group-hover:text-accent transition-colors`}>
                      {post.title}
                    </h2>
                  </Link>
                  <div className="mt-3 flex items-center gap-3">
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
                    <div className="flex items-center text-sm text-theme-muted">
                      <span className="font-medium text-theme-secondary">
                        {post.author.displayName || post.author.name || post.author.email}
                      </span>
                      <span className="mx-2">·</span>
                      <time>
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                    </div>
                  </div>
                  {post.description && (
                    <p className="mt-4 text-theme-secondary line-clamp-3 leading-relaxed">
                      {post.description}
                    </p>
                  )}
                  <Link
                    href={`/posts/${post.id}`}
                    className="mt-4 inline-flex items-center gap-1 text-accent hover:text-accent-hover font-medium transition-colors"
                  >
                    Read more
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className={`${theme.card.className} p-12 text-center`}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-theme-hover flex items-center justify-center">
                <svg className="w-8 h-8 text-theme-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <p className="text-theme-muted">No posts yet. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
