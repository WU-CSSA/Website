import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { DeleteButton } from "@/components/delete-button"
import { ContentRenderer } from "@/components/content-renderer"
import { theme } from "@/lib/theme"

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  const { id } = await params

  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: true },
  })

  if (!post || !post.published) {
    notFound()
  }

  const isAuthor = session?.user?.id === post.authorId
  const isAdmin = session?.user?.isAdmin ?? false
  const canManage = isAuthor || isAdmin

  return (
    <div className="min-h-screen bg-theme-bg">
      <article className={`${theme.container} ${theme.section}`}>
        <div className={`${theme.card.className} max-w-4xl mx-auto p-8`}>
          {/* Header */}
          <header className="mb-8 border-b border-theme-border pb-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className={`text-3xl md:text-4xl ${theme.text.heading} flex-1`}>
                {post.title}
              </h1>
              {canManage && (
                <div className="flex gap-2 ml-4">
                  <Link
                    href={`/posts/${post.id}/edit`}
                    className={theme.button.secondary}
                  >
                    Edit
                  </Link>
                  <DeleteButton id={post.id} type="post" redirectTo="/posts" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {post.author.image ? (
                <img
                  src={post.author.image}
                  alt={post.author.displayName || post.author.name || "User"}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-medium">
                  {(post.author.displayName || post.author.name || post.author.email || "U")[0].toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium text-theme-primary">
                  {post.author.displayName || post.author.name || post.author.email}
                </p>
                <time className="text-sm text-theme-muted">
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </div>
            </div>
          </header>

          {/* Content */}
          <ContentRenderer
            content={post.content}
            type={post.type}
            title={post.title}
            resourceType="post"
            resourceId={post.id}
          />
        </div>
      </article>
    </div>
  )
}
