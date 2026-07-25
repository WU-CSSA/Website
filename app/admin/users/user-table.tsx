"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { theme } from "@/lib/theme"

interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
  githubUsername: string | null
  displayName: string | null
  isAdmin: boolean
  isApproved: boolean
  hasCompletedOnboarding: boolean
  createdAt: Date
  _count: {
    posts: number
    events: number
  }
}

interface UserTableProps {
  users: User[]
  currentUserId: string
}

type FilterTab = "all" | "pending" | "approved" | "admin"

export function UserTable({ users, currentUserId }: UserTableProps) {
  const [filter, setFilter] = useState<FilterTab>("all")
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null)
  const router = useRouter()

  const filteredUsers = users.filter((user) => {
    switch (filter) {
      case "pending":
        return !user.isApproved && !user.isAdmin
      case "approved":
        return user.isApproved && !user.isAdmin
      case "admin":
        return user.isAdmin
      default:
        return true
    }
  })

  const counts = {
    all: users.length,
    pending: users.filter((u) => !u.isApproved && !u.isAdmin).length,
    approved: users.filter((u) => u.isApproved && !u.isAdmin).length,
    admin: users.filter((u) => u.isAdmin).length,
  }

  const handleAction = async (
    userId: string,
    action: "approve" | "revoke" | "makeAdmin" | "removeAdmin"
  ) => {
    setLoadingUserId(userId)
    try {
      const updates: { isApproved?: boolean; isAdmin?: boolean } = {}
      switch (action) {
        case "approve":
          updates.isApproved = true
          break
        case "revoke":
          updates.isApproved = false
          break
        case "makeAdmin":
          updates.isAdmin = true
          updates.isApproved = true
          break
        case "removeAdmin":
          updates.isAdmin = false
          break
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error("Failed to update user")
      }

      router.refresh()
    } catch (error) {
      console.error("Failed to update user:", error)
    } finally {
      setLoadingUserId(null)
    }
  }

  const handleDeny = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to deny and remove ${userName}? This action cannot be undone.`)) {
      return
    }

    setLoadingUserId(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete user")
      }

      router.refresh()
    } catch (error) {
      console.error("Failed to delete user:", error)
    } finally {
      setLoadingUserId(null)
    }
  }

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "admin", label: "Admin" },
  ]

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-theme-border pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-accent text-white"
                : "text-theme-secondary hover:bg-theme-hover"
            }`}
          >
            {tab.label}
            <span className="ml-2 text-xs opacity-70">({counts[tab.key]})</span>
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className={`${theme.card.className} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-theme-border bg-theme-hover/50">
                <th className="text-left px-6 py-4 text-sm font-semibold text-theme-primary">
                  User
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-theme-primary">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-theme-primary">
                  Content
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-theme-primary">
                  Joined
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-theme-primary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-theme-hover/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || "User"}
                          className="w-10 h-10 rounded-full border border-theme-border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-medium">
                          {(user.name || user.email || "U")[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-theme-primary">
                          {user.displayName || user.name || "Unknown"}
                        </div>
                        <div className="text-sm text-theme-muted">
                          {user.githubUsername ? (
                            <a
                              href={`https://github.com/${user.githubUsername}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-accent"
                            >
                              @{user.githubUsername}
                            </a>
                          ) : (
                            user.email
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.isAdmin && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                          Admin
                        </span>
                      )}
                      {user.isApproved ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                          Pending
                        </span>
                      )}
                      {!user.hasCompletedOnboarding && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-300">
                          No Profile
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-theme-secondary">
                      {user._count.posts} posts, {user._count.events} events
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-theme-muted">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {user.id === currentUserId ? (
                        <span className="text-sm text-theme-muted italic">
                          (You)
                        </span>
                      ) : (
                        <>
                          {!user.isApproved && !user.isAdmin && (
                            <>
                              <button
                                onClick={() => handleAction(user.id, "approve")}
                                disabled={loadingUserId === user.id}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleDeny(user.id, user.displayName || user.name || "this user")}
                                disabled={loadingUserId === user.id}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                              >
                                Deny
                              </button>
                            </>
                          )}
                          {user.isApproved && !user.isAdmin && (
                            <button
                              onClick={() => handleAction(user.id, "revoke")}
                              disabled={loadingUserId === user.id}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                            >
                              Revoke
                            </button>
                          )}
                          {!user.isAdmin && (
                            <button
                              onClick={() => handleAction(user.id, "makeAdmin")}
                              disabled={loadingUserId === user.id}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50"
                            >
                              Make Admin
                            </button>
                          )}
                          {user.isAdmin && (
                            <button
                              onClick={() =>
                                handleAction(user.id, "removeAdmin")
                              }
                              disabled={loadingUserId === user.id}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700/30 dark:text-gray-300 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50"
                            >
                              Remove Admin
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="px-6 py-12 text-center text-theme-muted">
            No users found in this category.
          </div>
        )}
      </div>
    </div>
  )
}
