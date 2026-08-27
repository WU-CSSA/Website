import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const {
      title,
      description,
      content,
      startDate,
      endDate,
      location,
    } = await request.json()

    // Check if event exists and user is the author
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (existingEvent.authorId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only edit your own events" },
        { status: 403 }
      )
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        content,
        startDate: startDate ? new Date(startDate) : existingEvent.startDate,
        endDate: endDate ? new Date(endDate) : null,
        location: location ?? existingEvent.location,
      },
    })

    return NextResponse.json({ event })
  } catch (error) {
    console.error("Update event error:", error)
    return NextResponse.json(
      { error: "An error occurred while updating the event" },
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

    // Check if event exists and user is the author
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (existingEvent.authorId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: "You can only delete your own events" },
        { status: 403 }
      )
    }

    await prisma.event.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete event error:", error)
    return NextResponse.json(
      { error: "An error occurred while deleting the event" },
      { status: 500 }
    )
  }
}
