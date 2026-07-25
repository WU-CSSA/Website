import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GitHub from "next-auth/providers/github"
import { prisma } from "@/lib/prisma"

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://")
const cookiePrefix = useSecureCookies ? "__Secure-" : ""

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true, // Required for proxies like Cloudflare Tunnels
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}authjs.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
    csrfToken: {
      name: `${cookiePrefix}authjs.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  events: {
    async createUser({ user }) {
      // When a new user is created, check if they should be the first admin
      const adminExists = await prisma.user.findFirst({
        where: { isAdmin: true, id: { not: user.id } },
        select: { id: true },
      })

      if (!adminExists) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            isAdmin: true,
            isApproved: true,
          },
        })
      }
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Update the access token and GitHub username on every sign in
      // Only update if this is an existing user (not a new sign-up)
      if (account?.provider === "github" && user.id && account.access_token) {
        // Check if user already exists (has an account)
        const existingAccount = await prisma.account.findFirst({
          where: {
            userId: user.id,
            provider: "github",
          },
        })

        // Only update existing accounts, not new ones being created
        if (existingAccount) {
          await prisma.account.updateMany({
            where: {
              userId: user.id,
              provider: "github",
            },
            data: {
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
            },
          })

          // Also update GitHub username
          if (profile?.login) {
            await prisma.user.update({
              where: { id: user.id },
              data: { githubUsername: profile.login as string },
            })
          }
        }
      }
      return true
    },
    async jwt({ token, user, trigger, session }) {
      // Only fetch from DB on sign-in or explicit update (not on every request)
      // This avoids Prisma calls in Edge runtime (middleware)
      if (user) {
        // Initial sign-in: fetch user data from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            githubUsername: true,
            displayName: true,
            isAdmin: true,
            isApproved: true,
            hasCompletedOnboarding: true,
          },
        })
        if (dbUser) {
          token.githubUsername = dbUser.githubUsername
          token.displayName = dbUser.displayName
          token.isAdmin = dbUser.isAdmin
          token.isApproved = dbUser.isApproved
          token.hasCompletedOnboarding = dbUser.hasCompletedOnboarding
        }
      } else if (trigger === "update" && session) {
        // Explicit session update from client - merge the provided data
        token.displayName = session.displayName ?? token.displayName
        token.isAdmin = session.isAdmin ?? token.isAdmin
        token.isApproved = session.isApproved ?? token.isApproved
        token.hasCompletedOnboarding = session.hasCompletedOnboarding ?? token.hasCompletedOnboarding
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.githubUsername = token.githubUsername as string | undefined
        session.user.displayName = token.displayName as string | null
        session.user.isAdmin = token.isAdmin as boolean
        session.user.isApproved = token.isApproved as boolean
        session.user.hasCompletedOnboarding = token.hasCompletedOnboarding as boolean
      }
      return session
    },
  },
})
