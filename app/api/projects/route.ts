import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      include: { author: true },
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error("Get projects error:", error)
    return NextResponse.json(
      { error: "An error occurred while fetching projects" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has permission to create projects (admin only)
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: "Only administrators can create projects" },
        { status: 403 }
      )
    }

    const {
      title,
      description,
      content,
      imageUrl,
      githubUrl,
      demoUrl,
      technologies,
      featured,
      authorId,
    } = await request.json()

    if (!title || !description || !content) {
      return NextResponse.json(
        { error: "Title, description, and content are required" },
        { status: 400 }
      )
    }

    if (authorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        content,
        imageUrl: imageUrl || null,
        githubUrl: githubUrl || null,
        demoUrl: demoUrl || null,
        technologies: technologies || [],
        featured: featured || false,
        published: true,
        authorId,
      },
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error("Create project error:", error)
    return NextResponse.json(
      { error: "An error occurred while creating the project" },
      { status: 500 }
    )
  }
}
