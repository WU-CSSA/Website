import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { displayName } = await request.json()

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        displayName: displayName || null,
        hasCompletedOnboarding: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Onboarding error:", error)
    return NextResponse.json(
      { error: "An error occurred while completing onboarding" },
      { status: 500 }
    )
  }
}
