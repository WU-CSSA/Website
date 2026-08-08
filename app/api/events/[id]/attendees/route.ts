import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const event = await prisma.event.findUnique({
      where: { id },
      select: { id: true, startDate: true, endDate: true },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const attendees = await prisma.eventRegistration.findMany({
      where: {
        eventId: id,
        checkedInAt: { not: null },
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { checkedInAt: "asc" },
    })

    return NextResponse.json({
      attendees: attendees.map((a) => ({
        id: a.user.id,
        displayName: a.user.displayName || a.user.name,
        image: a.user.image,
        checkedInAt: a.checkedInAt,
      })),
      count: attendees.length,
    })
  } catch (error) {
    console.error("Get attendees error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
