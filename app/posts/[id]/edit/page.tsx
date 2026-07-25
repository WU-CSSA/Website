import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EditPostForm } from "./edit-post-form"
import { theme } from "@/lib/theme"

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const { id } = await params

  const post = await prisma.post.findUnique({
    where: { id },
  })

  if (!post) {
    notFound()
  }

  if (post.authorId !== session.user.id) {
    redirect("/posts")
  }

  return (
    <div className="min-h-screen bg-theme-bg">
      <div className={`${theme.container} ${theme.section}`}>
        <div className={`${theme.card.className} max-w-4xl mx-auto p-8`}>
          <h1 className={`text-3xl ${theme.text.heading} mb-2`}>Edit Post</h1>
          <p className={`${theme.text.muted} mb-8`}>Update your post content</p>
          <EditPostForm post={post} />
        </div>
      </div>
    </div>
  )
}
