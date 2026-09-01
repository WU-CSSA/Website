import { prisma } from "@/lib/prisma"

export interface RankedAttendee {
  rank: number
  id: string
  displayName: string | null
  image: string | null
  checkInCount: number
}

/**
 * Users ranked by number of events they've *checked in* to, most first.
 *
 * Note: this can't be done with `user.findMany({ orderBy: { eventRegistrations:
 * { _count } } })` because that count includes RSVP-only registrations, so the
 * sort key would diverge from the displayed check-in count. Grouping the
 * check-in rows directly keeps the two in sync.
 */
export async function getAttendanceLeaderboard(
  limit = 50
): Promise<RankedAttendee[]> {
  const grouped = await prisma.eventRegistration.groupBy({
    by: ["userId"],
    where: { checkedInAt: { not: null } },
    _count: { userId: true },
    orderBy: { _count: { userId: "desc" } },
    take: limit,
  })

  if (grouped.length === 0) return []

  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.userId) } },
    select: { id: true, displayName: true, name: true, image: true },
  })
  const byId = new Map(users.map((u) => [u.id, u]))

  return grouped
    .flatMap((g) => {
      const user = byId.get(g.userId)
      return user ? [{ user, checkInCount: g._count.userId }] : []
    })
    .map(({ user, checkInCount }, index) => ({
      rank: index + 1,
      id: user.id,
      displayName: user.displayName || user.name,
      image: user.image,
      checkInCount,
    }))
}
