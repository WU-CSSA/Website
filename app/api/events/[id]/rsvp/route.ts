import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    const event = await prisma.event.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const rsvpCount = await prisma.eventRegistration.count({
      where: { eventId: id, rsvpedAt: { not: null } },
    })

    let userRsvp = null
    if (session?.user?.id) {
      userRsvp = await prisma.eventRegistration.findUnique({
        where: { eventId_userId: { eventId: id, userId: session.user.id } },
        select: { rsvpedAt: true, checkedInAt: true },
      })
    }

    return NextResponse.json({
      rsvpCount,
      hasRsvped: !!userRsvp?.rsvpedAt,
      hasCheckedIn: !!userRsvp?.checkedInAt,
    })
  } catch (error) {
    console.error("Get RSVP status error:", error)
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
      select: { id: true, startDate: true },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const registration = await prisma.eventRegistration.upsert({
      where: { eventId_userId: { eventId: id, userId: session.user.id } },
      update: { rsvpedAt: new Date() },
      create: {
        eventId: id,
        userId: session.user.id,
        rsvpedAt: new Date(),
      },
    })

    const rsvpCount = await prisma.eventRegistration.count({
      where: { eventId: id, rsvpedAt: { not: null } },
    })

    return NextResponse.json({
      success: true,
      rsvpCount,
      hasRsvped: true,
    })
  } catch (error) {
    console.error("RSVP error:", error)
    return NextResponse.json(
      { error: "An error occurred while processing your RSVP" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const registration = await prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId: id, userId: session.user.id } },
    })

    if (registration) {
      await prisma.eventRegistration.update({
        where: { eventId_userId: { eventId: id, userId: session.user.id } },
        data: { rsvpedAt: null },
      })
    }

    const rsvpCount = await prisma.eventRegistration.count({
      where: { eventId: id, rsvpedAt: { not: null } },
    })

    return NextResponse.json({
      success: true,
      rsvpCount,
      hasRsvped: false,
    })
  } catch (error) {
    console.error("Cancel RSVP error:", error)
    return NextResponse.json(
      { error: "An error occurred while canceling your RSVP" },
      { status: 500 }
    )
  }
}
