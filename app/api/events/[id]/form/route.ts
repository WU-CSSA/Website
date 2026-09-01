import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        checkInFormRequired: true,
        checkInForm: {
          include: { questions: { orderBy: { order: "asc" } } },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({
      required: event.checkInFormRequired,
      form: event.checkInForm,
    })
  } catch (error) {
    console.error("Get event form error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const formId: string | null =
      typeof body.formId === "string" && body.formId ? body.formId : null
    const required = body.required !== false

    const event = await prisma.event.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    })
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (event.authorId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: "Only the event author or an admin can set the exit poll" },
        { status: 403 }
      )
    }

    if (formId) {
      const form = await prisma.form.findUnique({
        where: { id: formId },
        select: { id: true },
      })
      if (!form) {
        return NextResponse.json({ error: "Form not found" }, { status: 404 })
      }
    }

    await prisma.event.update({
      where: { id },
      data: { checkInFormId: formId, checkInFormRequired: required },
    })

    return NextResponse.json({ success: true, formId, required })
  } catch (error) {
    console.error("Set event form error:", error)
    return NextResponse.json(
      { error: "An error occurred while updating the exit poll" },
      { status: 500 }
    )
  }
}
