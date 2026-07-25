"use client"

import { useEffect, useState } from "react"
import { getContributionLevel, generateDateRange, CombinedContributions } from "@/lib/github"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function ContributionGraph() {
  const [data, setData] = useState<CombinedContributions | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/contributions")
        if (!response.ok) throw new Error("Failed to fetch contributions")
        const json = await response.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="bg-theme-card rounded-xl border border-theme-border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-theme-hover rounded w-48 mb-4"></div>
          <div className="h-32 bg-theme-hover rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-theme-card rounded-xl border border-theme-border p-6 text-center">
        <p className="text-theme-muted">Unable to load contribution data</p>
      </div>
    )
  }

  if (data.userCount === 0) {
    return (
      <div className="bg-theme-card rounded-xl border border-theme-border p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-theme-hover flex items-center justify-center">
          <svg className="w-8 h-8 text-theme-muted" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-theme-muted">No members have signed in yet</p>
        <p className="text-sm text-theme-muted mt-1">Sign in with GitHub to see your contributions here!</p>
      </div>
    )
  }

  const dates = generateDateRange(52)
  const weeks: string[][] = []

  // Group dates into weeks (7 days each)
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7))
  }

  return (
    <div className="bg-theme-card rounded-xl border border-theme-border p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-theme-primary">Member Activity</h3>
          <p className="text-sm text-theme-muted">
            {data.totalContributions.toLocaleString()} contributions from {data.userCount} member{data.userCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex -space-x-2">
          {data.users.slice(0, 5).map((user) => {
            const name = user.displayName || user.username
            return (
              <div
                key={user.username}
                className="w-8 h-8 rounded-full border-2 border-theme-card bg-accent/10 flex items-center justify-center overflow-hidden"
                title={`${name}: ${user.totalContributions.toLocaleString()} contributions`}
              >
                {user.image ? (
                  <img src={user.image} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-medium text-accent">
                    {name[0].toUpperCase()}
                  </span>
                )}
              </div>
            )
          })}
          {data.users.length > 5 && (
            <div className="w-8 h-8 rounded-full border-2 border-theme-card bg-theme-hover flex items-center justify-center">
              <span className="text-xs font-medium text-theme-muted">+{data.users.length - 5}</span>
            </div>
          )}
        </div>
      </div>

      {/* Graph container with horizontal scroll on mobile */}
      <div className="overflow-x-auto -mx-6 px-6">
        <div className="inline-block min-w-max">
          {/* Graph grid with month labels */}
          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col text-xs text-theme-muted mr-2 pt-5" style={{ gap: "3px" }}>
              {DAYS.map((day, i) => (
                <div key={day} className="h-[10px] flex items-center">
                  {i % 2 === 1 ? day : ""}
                </div>
              ))}
            </div>

            {/* Weeks with month labels above */}
            <div className="flex" style={{ gap: "3px" }}>
              {weeks.map((week, weekIndex) => {
                // Check if this week starts a new month
                const firstDay = new Date(week[0])
                const prevWeekFirstDay = weekIndex > 0 ? new Date(weeks[weekIndex - 1][0]) : null
                const showMonth = !prevWeekFirstDay || firstDay.getMonth() !== prevWeekFirstDay.getMonth()

                return (
                  <div key={weekIndex} className="flex flex-col" style={{ gap: "3px" }}>
                    {/* Month label */}
                    <div className="h-4 text-xs text-theme-muted">
                      {showMonth ? MONTHS[firstDay.getMonth()] : ""}
                    </div>
                    {/* Week cells */}
                    {week.map((date) => {
                      const count = data.contributions[date] || 0
                      const level = getContributionLevel(count)
                      return (
                        <div
                          key={date}
                          className={`w-[10px] h-[10px] rounded-sm transition-colors ${getLevelClass(level)}`}
                          title={`${date}: ${count} contribution${count !== 1 ? "s" : ""}`}
                        />
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end mt-4 gap-2 text-xs text-theme-muted">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-[10px] h-[10px] rounded-sm ${getLevelClass(level)}`}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Top contributors */}
      {data.users.length > 0 && (
        <div className="mt-6 pt-6 border-t border-theme-border">
          <h4 className="text-sm font-medium text-theme-primary mb-3">Top Contributors</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {data.users.slice(0, 6).map((user, index) => {
              const name = user.displayName || user.username
              return (
                <a
                  key={user.username}
                  href={`https://github.com/${user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-theme-hover transition-colors group"
                >
                  <div className="relative">
                    {index < 3 && (
                      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        index === 0 ? "bg-yellow-500 text-yellow-950" :
                        index === 1 ? "bg-gray-300 text-gray-700" :
                        "bg-amber-600 text-amber-100"
                      }`}>
                        {index + 1}
                      </div>
                    )}
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden">
                      {user.image ? (
                        <img src={user.image} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-medium text-accent">
                          {name[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-theme-primary truncate group-hover:text-accent transition-colors">
                      {name}
                    </p>
                    <p className="text-xs text-theme-muted">
                      {user.totalContributions.toLocaleString()} contributions
                    </p>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function getLevelClass(level: number): string {
  switch (level) {
    case 0:
      return "bg-theme-hover"
    case 1:
      return "bg-emerald-200 dark:bg-emerald-900"
    case 2:
      return "bg-emerald-400 dark:bg-emerald-700"
    case 3:
      return "bg-emerald-500 dark:bg-emerald-500"
    case 4:
      return "bg-emerald-600 dark:bg-emerald-400"
    default:
      return "bg-theme-hover"
  }
}
