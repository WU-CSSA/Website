import { prisma } from "@/lib/prisma"
import { buildRevealHtml } from "@/lib/reveal"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const post = await prisma.post.findUnique({
    where: { id },
  })

  if (!post || !post.published) {
    return new Response("Not found", { status: 404 })
  }

  if (post.type === "MARKDOWN") {
    return new Response("This post is not a presentation", { status: 400 })
  }

  const html = buildRevealHtml(post.content, post.type, post.title)

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  })
}
