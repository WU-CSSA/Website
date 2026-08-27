import { prisma } from "@/lib/prisma"
import { buildRevealHtml } from "@/lib/reveal"
import { buildPptxViewerHtml } from "@/lib/pptx"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const project = await prisma.project.findUnique({
    where: { id },
  })

  if (!project || !project.published) {
    return new Response("Not found", { status: 404 })
  }

  if (project.type === "MARKDOWN") {
    return new Response("This project is not a presentation", { status: 400 })
  }

  const html =
    project.type === "PPTX"
      ? buildPptxViewerHtml(project.content, project.title)
      : buildRevealHtml(project.content, project.type, project.title)

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  })
}
