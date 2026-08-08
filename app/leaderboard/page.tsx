import { prisma } from "@/lib/prisma"
import { theme } from "@/lib/theme"
import { AttendanceLeaderboard } from "@/components/attendance-leaderboard"

export const metadata = {
  title: "Attendance Leaderboard | CSSA",
  description: "See who attends the most CSSA events",
}

export default async function LeaderboardPage() {
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
    take: 100,
  })

  const rankedUsers = leaderboard
    .filter((user) => user._count.eventRegistrations > 0)
    .map((user, index) => ({
      rank: index + 1,
      id: user.id,
      displayName: user.displayName || user.name,
      image: user.image,
      checkInCount: user._count.eventRegistrations,
    }))

  return (
    <div className="min-h-screen bg-theme-bg">
      <div className={`${theme.container} ${theme.section}`}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className={`text-3xl md:text-4xl ${theme.text.heading}`}>
              Attendance Leaderboard
            </h1>
            <p className={`mt-2 ${theme.text.muted}`}>
              Recognizing our most active event attendees
            </p>
          </div>

          {rankedUsers.length > 0 ? (
            <div className={`${theme.card.className} p-6`}>
              <AttendanceLeaderboard users={rankedUsers} />
            </div>
          ) : (
            <div className={`${theme.card.className} p-12 text-center`}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-theme-hover flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-theme-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <p className="text-theme-muted">
                No attendance data yet. Check in at events to join the leaderboard!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
