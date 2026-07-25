import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to create posts (admin only)
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: "Only administrators can create posts" },
        { status: 403 }
      )
    }

    const { title, description, content, authorId } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      )
    }

    if (authorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const post = await prisma.post.create({
      data: {
        title,
        description: description || null,
        content,
        published: true,
        authorId,
      },
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error("Create post error:", error)
    return NextResponse.json(
      { error: "An error occurred while creating the post" },
      { status: 500 }
    )
  }
}
