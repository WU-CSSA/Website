// GitHub API utilities for fetching contribution data

interface ContributionDay {
  date: string
  contributionCount: number
}

interface ContributionWeek {
  contributionDays: ContributionDay[]
}

interface GitHubContributionResponse {
  data?: {
    user?: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number
          weeks: ContributionWeek[]
        }
      }
    }
  }
  errors?: Array<{ message: string }>
}

export interface ContributionData {
  username: string
  totalContributions: number
  contributions: Record<string, number> // date -> count
}

export interface CombinedContributions {
  contributions: Record<string, number> // date -> combined count
  totalContributions: number
  userCount: number
  users: Array<{
    username: string
    displayName?: string | null
    totalContributions: number
    image?: string | null
  }>
}

/**
 * Fetch contribution data for a GitHub user using the GraphQL API
 * Uses OAuth token from a signed-in user
 */
export async function fetchUserContributions(
  username: string,
  oauthToken: string
): Promise<ContributionData | null> {
  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${oauthToken}`,
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      console.error(`GitHub API error for ${username}: ${response.status}`)
      return null
    }

    const data: GitHubContributionResponse = await response.json()

    if (data.errors) {
      console.error(`GitHub GraphQL errors for ${username}:`, data.errors)
      return null
    }

    if (!data.data?.user) {
      console.error(`User not found: ${username}`)
      return null
    }

    const calendar = data.data.user.contributionsCollection.contributionCalendar
    const contributions: Record<string, number> = {}

    for (const week of calendar.weeks) {
      for (const day of week.contributionDays) {
        contributions[day.date] = day.contributionCount
      }
    }

    return {
      username,
      totalContributions: calendar.totalContributions,
      contributions,
    }
  } catch (error) {
    console.error(`Error fetching contributions for ${username}:`, error)
    return null
  }
}

/**
 * Get the contribution level (0-4) for styling purposes
 */
export function getContributionLevel(count: number): number {
  if (count === 0) return 0
  if (count <= 3) return 1
  if (count <= 6) return 2
  if (count <= 9) return 3
  return 4
}

/**
 * Generate dates for the last N weeks (for the graph)
 */
export function generateDateRange(weeks: number = 52): string[] {
  const dates: string[] = []
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - weeks * 7)

  // Adjust to start on Sunday
  const dayOfWeek = startDate.getDay()
  startDate.setDate(startDate.getDate() - dayOfWeek)

  const current = new Date(startDate)
  while (current <= today) {
    dates.push(current.toISOString().split("T")[0])
    current.setDate(current.getDate() + 1)
  }

  return dates
}
