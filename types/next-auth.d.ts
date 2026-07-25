import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      githubUsername?: string
      displayName?: string | null
      isAdmin: boolean
      isApproved: boolean
      hasCompletedOnboarding: boolean
    } & DefaultSession["user"]
  }
}
