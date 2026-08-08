import { theme } from "@/lib/theme"

interface LeaderboardUser {
  rank: number
  id: string
  displayName: string | null
  image: string | null
  checkInCount: number
}

interface AttendanceLeaderboardProps {
  users: LeaderboardUser[]
  compact?: boolean
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 flex items-center justify-center text-sm font-bold">
        1
      </span>
    )
  }
  if (rank === 2) {
    return (
      <span className="w-6 h-6 rounded-full bg-gray-300/30 text-gray-500 dark:text-gray-400 flex items-center justify-center text-sm font-bold">
        2
      </span>
    )
  }
  if (rank === 3) {
    return (
      <span className="w-6 h-6 rounded-full bg-amber-600/20 text-amber-700 dark:text-amber-500 flex items-center justify-center text-sm font-bold">
        3
      </span>
    )
  }
  return (
    <span className="w-6 h-6 text-theme-muted flex items-center justify-center text-sm">
      {rank}
    </span>
  )
}

export function AttendanceLeaderboard({
  users,
  compact = false,
}: AttendanceLeaderboardProps) {
  if (users.length === 0) {
    return (
      <div className={`${theme.card.className} p-6`}>
        <p className="text-sm text-theme-muted text-center">
          No attendance data yet
        </p>
      </div>
    )
  }

  return (
    <div className={compact ? "" : `${theme.card.className} p-6`}>
      {!compact && (
        <h3 className={`text-lg font-medium ${theme.text.heading} mb-4`}>
          Top Event Attendees
        </h3>
      )}
      <ul className={compact ? "space-y-2" : "space-y-3"}>
        {users.map((user) => (
          <li
            key={user.id}
            className={`flex items-center gap-3 ${
              compact ? "py-1" : "py-2"
            }`}
          >
            <RankBadge rank={user.rank} />
            {user.image ? (
              <img
                src={user.image}
                alt={user.displayName || "User"}
                className={compact ? "w-7 h-7 rounded-full" : "w-9 h-9 rounded-full"}
              />
            ) : (
              <div
                className={`${
                  compact ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm"
                } rounded-full bg-accent/10 flex items-center justify-center text-accent font-medium`}
              >
                {(user.displayName || "U")[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <span
                className={`${
                  compact ? "text-sm" : "text-base"
                } text-theme-primary truncate block`}
              >
                {user.displayName || "Anonymous"}
              </span>
            </div>
            <span className="text-sm text-theme-muted">
              {user.checkInCount} {user.checkInCount === 1 ? "event" : "events"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
