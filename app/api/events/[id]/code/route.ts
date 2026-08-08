import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

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

    const event = await prisma.event.findUnique({
      where: { id },
      select: { id: true, checkInCode: true, authorId: true },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    })

    if (event.authorId !== session.user.id && !user?.isAdmin) {
      return NextResponse.json(
        { error: "Only the event author or admin can view the check-in code" },
        { status: 403 }
      )
    }

    return NextResponse.json({ code: event.checkInCode })
  } catch (error) {
    console.error("Get code error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const event = await prisma.event.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    })

    if (event.authorId !== session.user.id && !user?.isAdmin) {
      return NextResponse.json(
        { error: "Only the event author or admin can generate a check-in code" },
        { status: 403 }
      )
    }

    const newCode = generateCode()

    await prisma.event.update({
      where: { id },
      data: { checkInCode: newCode },
    })

    return NextResponse.json({ code: newCode })
  } catch (error) {
    console.error("Generate code error:", error)
    return NextResponse.json(
      { error: "An error occurred while generating the code" },
      { status: 500 }
    )
  }
}
