import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { UserTable } from "./user-table"
import { theme } from "@/lib/theme"

export default async function AdminUsersPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (!session.user.isAdmin) {
    redirect("/")
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      githubUsername: true,
      displayName: true,
      isAdmin: true,
      isApproved: true,
      hasCompletedOnboarding: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          events: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="min-h-screen bg-theme-bg py-12">
      <div className={theme.container}>
        <div className="mb-8">
          <h1 className={`text-3xl ${theme.text.heading}`}>User Management</h1>
          <p className="text-theme-muted mt-2">
            Manage member approvals and admin access
          </p>
        </div>

        <UserTable users={users} currentUserId={session.user.id} />
      </div>
    </div>
  )
}
