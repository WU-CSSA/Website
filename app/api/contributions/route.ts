import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { fetchUserContributions, CombinedContributions } from "@/lib/github"

export const revalidate = 3600 // Cache for 1 hour

export async function GET() {
  try {
    // Get all approved/admin users with GitHub usernames and their OAuth tokens
    const users = await prisma.user.findMany({
      where: {
        githubUsername: { not: null },
        OR: [{ isAdmin: true }, { isApproved: true }],
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        image: true,
        githubUsername: true,
        accounts: {
          where: { provider: "github" },
          select: { access_token: true },
        },
      },
    })

    if (users.length === 0) {
      return NextResponse.json({
        contributions: {},
        totalContributions: 0,
        userCount: 0,
        users: [],
      } as CombinedContributions)
    }

    // Find a valid OAuth token to use for API requests
    const tokenUser = users.find((u) => u.accounts[0]?.access_token)
    const oauthToken = tokenUser?.accounts[0]?.access_token

    if (!oauthToken) {
      return NextResponse.json({
        contributions: {},
        totalContributions: 0,
        userCount: 0,
        users: [],
      })
    }

    // Fetch contributions for all users in parallel using the OAuth token
    const contributionPromises = users.map((user) =>
      fetchUserContributions(user.githubUsername!, oauthToken)
    )
    const allContributions = await Promise.all(contributionPromises)

    // Combine all contributions
    const combinedContributions: Record<string, number> = {}
    let totalContributions = 0
    const userStats: CombinedContributions["users"] = []

    for (let i = 0; i < users.length; i++) {
      const contributions = allContributions[i]
      const user = users[i]

      if (contributions) {
        totalContributions += contributions.totalContributions
        userStats.push({
          username: contributions.username,
          displayName: user.displayName,
          totalContributions: contributions.totalContributions,
          image: user.image,
        })

        for (const [date, count] of Object.entries(contributions.contributions)) {
          combinedContributions[date] = (combinedContributions[date] || 0) + count
        }
      }
    }

    // Sort users by contribution count
    userStats.sort((a, b) => b.totalContributions - a.totalContributions)

    return NextResponse.json({
      contributions: combinedContributions,
      totalContributions,
      userCount: userStats.length,
      users: userStats,
    } as CombinedContributions)
  } catch (error) {
    console.error("Error fetching contributions:", error)
    return NextResponse.json(
      { error: "Failed to fetch contributions" },
      { status: 500 }
    )
  }
}
