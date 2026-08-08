import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50", 10)

    const leaderboard = await prisma.user.findMany({
      where: {
        eventRegistrations: {
          some: {
            checkedInAt: { not: null },
          },
        },
      },
      select: {
        id: true,
        displayName: true,
        name: true,
        image: true,
        _count: {
          select: {
            eventRegistrations: {
              where: { checkedInAt: { not: null } },
            },
          },
        },
      },
      orderBy: {
        eventRegistrations: {
          _count: "desc",
        },
      },
      take: limit,
    })

    // Filter only users with check-ins and format the response
    const rankedUsers = leaderboard
      .filter((user) => user._count.eventRegistrations > 0)
      .map((user, index) => ({
        rank: index + 1,
        id: user.id,
        displayName: user.displayName || user.name,
        image: user.image,
        checkInCount: user._count.eventRegistrations,
      }))

    return NextResponse.json({ leaderboard: rankedUsers })
  } catch (error) {
    console.error("Get leaderboard error:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
  }
}
