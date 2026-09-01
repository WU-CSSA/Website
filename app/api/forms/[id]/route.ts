import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { normalizeQuestions } from "@/lib/forms"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  if (!session.user.isAdmin) {
    return {
      error: NextResponse.json(
        { error: "Only administrators can manage forms" },
        { status: 403 }
      ),
    }
  }
  return { session }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireAdmin()
    if (guard.error) return guard.error

    const { id } = await params
    const form = await prisma.form.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { order: "asc" } },
        _count: { select: { responses: true, events: true } },
      },
    })

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    return NextResponse.json({ form })
  } catch (error) {
    console.error("Get form error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireAdmin()
    if (guard.error) return guard.error

    const { id } = await params
    const body = await request.json()

    const existing = await prisma.form.findUnique({
      where: { id },
      select: { id: true, questions: { select: { id: true } } },
    })
    if (!existing) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    const title = typeof body.title === "string" ? body.title.trim() : ""
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const normalized = normalizeQuestions(body.questions)
    if (!normalized.ok) {
      return NextResponse.json({ error: normalized.error }, { status: 400 })
    }

    const existingIds = new Set(existing.questions.map((q) => q.id))
    const keptIds = new Set(
      normalized.questions
        .map((q) => q.id)
        .filter((qid): qid is string => !!qid && existingIds.has(qid))
    )
    const toDelete = [...existingIds].filter((qid) => !keptIds.has(qid))

    await prisma.$transaction([
      prisma.form.update({
        where: { id },
        data: {
          title,
          description:
            typeof body.description === "string" && body.description.trim()
              ? body.description.trim()
              : null,
          published: body.published !== false,
        },
      }),
      prisma.formQuestion.deleteMany({
        where: { id: { in: toDelete } },
      }),
      ...normalized.questions.map((q) =>
        q.id && keptIds.has(q.id)
          ? prisma.formQuestion.update({
              where: { id: q.id },
              data: {
                order: q.order,
                type: q.type,
                label: q.label,
                description: q.description,
                required: q.required,
                options: q.options,
                allowOther: q.allowOther,
                minRating: q.minRating,
                maxRating: q.maxRating,
              },
            })
          : prisma.formQuestion.create({
              data: {
                formId: id,
                order: q.order,
                type: q.type,
                label: q.label,
                description: q.description,
                required: q.required,
                options: q.options,
                allowOther: q.allowOther,
                minRating: q.minRating,
                maxRating: q.maxRating,
              },
            })
      ),
    ])

    return NextResponse.json({ form: { id } })
  } catch (error) {
    console.error("Update form error:", error)
    return NextResponse.json(
      { error: "An error occurred while updating the form" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await requireAdmin()
    if (guard.error) return guard.error

    const { id } = await params
    const force = request.nextUrl.searchParams.get("force") === "true"

    const form = await prisma.form.findUnique({
      where: { id },
      select: { id: true, _count: { select: { responses: true } } },
    })
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    if (form._count.responses > 0 && !force) {
      return NextResponse.json(
        {
          error: `This form has ${form._count.responses} response(s). Deleting it will remove them permanently.`,
          responseCount: form._count.responses,
        },
        { status: 409 }
      )
    }

    await prisma.form.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete form error:", error)
    return NextResponse.json(
      { error: "An error occurred while deleting the form" },
      { status: 500 }
    )
  }
}
