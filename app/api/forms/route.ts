import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { normalizeQuestions } from "@/lib/forms"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: "Only administrators can manage forms" },
        { status: 403 }
      )
    }

    const forms = await prisma.form.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { displayName: true, name: true } },
        _count: { select: { questions: true, responses: true, events: true } },
      },
    })

    return NextResponse.json({ forms })
  } catch (error) {
    console.error("List forms error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: "Only administrators can create forms" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const title = typeof body.title === "string" ? body.title.trim() : ""
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const normalized = normalizeQuestions(body.questions)
    if (!normalized.ok) {
      return NextResponse.json({ error: normalized.error }, { status: 400 })
    }

    const form = await prisma.form.create({
      data: {
        title,
        description:
          typeof body.description === "string" && body.description.trim()
            ? body.description.trim()
            : null,
        published: body.published !== false,
        authorId: session.user.id,
        questions: {
          create: normalized.questions.map((q) => ({
            order: q.order,
            type: q.type,
            label: q.label,
            description: q.description,
            required: q.required,
            options: q.options,
            allowOther: q.allowOther,
            minRating: q.minRating,
            maxRating: q.maxRating,
          })),
        },
      },
      select: { id: true },
    })

    return NextResponse.json({ form }, { status: 201 })
  } catch (error) {
    console.error("Create form error:", error)
    return NextResponse.json(
      { error: "An error occurred while creating the form" },
      { status: 500 }
    )
  }
}
