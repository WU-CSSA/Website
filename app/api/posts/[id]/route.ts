import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validateContentForType } from "@/lib/content-validation"

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
    const { title, description, content, type } = await request.json()

    // Check if post exists and user is the author
    const existingPost = await prisma.post.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    if (existingPost.authorId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: "You can only edit your own posts" },
        { status: 403 }
      )
    }

    if (content) {
      const contentError = validateContentForType(type || existingPost.type, content)
      if (contentError) {
        return NextResponse.json({ error: contentError }, { status: 400 })
      }
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        description: description || null,
        content,
        ...(type && { type }),
      },
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Update post error:", error)
    return NextResponse.json(
      { error: "An error occurred while updating the post" },
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

    // Check if post exists and user is the author
    const existingPost = await prisma.post.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    if (existingPost.authorId !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json(
        { error: "You can only delete your own posts" },
        { status: 403 }
      )
    }

    await prisma.post.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete post error:", error)
    return NextResponse.json(
      { error: "An error occurred while deleting the post" },
      { status: 500 }
    )
  }
}
