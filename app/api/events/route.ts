import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to create events (admin only)
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: "Only administrators can create events" },
        { status: 403 }
      )
    }

    const {
      title,
      description,
      content,
      startDate,
      endDate,
      location,
      authorId,
    } = await request.json()

    if (!title || !description || !content || !startDate) {
      return NextResponse.json(
        { error: "Title, description, content, and start date are required" },
        { status: 400 }
      )
    }

    if (authorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        content,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        location,
        published: true,
        authorId,
      },
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error("Create event error:", error)
    return NextResponse.json(
      { error: "An error occurred while creating the event" },
      { status: 500 }
    )
  }
}
