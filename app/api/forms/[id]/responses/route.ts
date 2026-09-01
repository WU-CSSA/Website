import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const eventId = request.nextUrl.searchParams.get("eventId")

    const form = await prisma.form.findUnique({
      where: { id },
      include: { questions: { orderBy: { order: "asc" } } },
    })
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    // Access: site admins, the form's author, or (when scoped to an event) the
    // author of that event.
    let allowed = session.user.isAdmin || form.authorId === session.user.id
    if (!allowed && eventId) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { authorId: true },
      })
      allowed = !!event && event.authorId === session.user.id
    }
    if (!allowed) {
      return NextResponse.json(
        { error: "You do not have access to these responses" },
        { status: 403 }
      )
    }

    const responses = await prisma.formResponse.findMany({
      where: { formId: id, ...(eventId ? { eventId } : {}) },
      orderBy: { createdAt: "desc" },
      include: {
        answers: { select: { questionId: true, value: true } },
        user: {
          select: { id: true, displayName: true, name: true, image: true },
        },
        event: { select: { id: true, title: true } },
      },
    })

    return NextResponse.json({
      form: {
        id: form.id,
        title: form.title,
        description: form.description,
        questions: form.questions,
      },
      responses: responses.map((r) => ({
        id: r.id,
        createdAt: r.createdAt,
        event: r.event,
        user: {
          id: r.user.id,
          displayName: r.user.displayName || r.user.name,
          image: r.user.image,
        },
        answers: r.answers,
      })),
      count: responses.length,
    })
  } catch (error) {
    console.error("Get form responses error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
