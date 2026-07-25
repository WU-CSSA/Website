import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { CreatePostForm } from "./create-post-form"
import { theme } from "@/lib/theme"

export default async function NewPostPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-theme-bg">
      <div className={`${theme.container} ${theme.section}`}>
        <div className={`${theme.card.className} max-w-4xl mx-auto p-8`}>
          <h1 className={`text-3xl ${theme.text.heading} mb-2`}>Create New Post</h1>
          <p className={`${theme.text.muted} mb-8`}>Share your thoughts with the community</p>
          <CreatePostForm userId={session.user.id} />
        </div>
      </div>
    </div>
  )
}
