import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
    const { code } = await request.json()

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    const event = await prisma.event.findUnique({
      where: { id },
      select: { id: true, checkInCode: true, title: true },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (!event.checkInCode) {
      return NextResponse.json(
        { error: "Check-in is not enabled for this event" },
        { status: 400 }
      )
    }

    if (code !== event.checkInCode) {
      return NextResponse.json({ error: "Invalid check-in code" }, { status: 400 })
    }

    const registration = await prisma.eventRegistration.upsert({
      where: { eventId_userId: { eventId: id, userId: session.user.id } },
      update: { checkedInAt: new Date() },
      create: {
        eventId: id,
        userId: session.user.id,
        checkedInAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      checkedInAt: registration.checkedInAt,
    })
  } catch (error) {
    console.error("Check-in error:", error)
    return NextResponse.json(
      { error: "An error occurred while checking in" },
      { status: 500 }
    )
  }
}
