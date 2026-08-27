"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { loginHref } from "@/lib/login-url"

interface SignInLinkProps {
  className?: string
  children: React.ReactNode
}

/**
 * Link to /login that remembers the current page as callbackUrl, so the user
 * lands back where they were after signing in with GitHub.
 */
export function SignInLink({ className, children }: SignInLinkProps) {
  const pathname = usePathname()

  return (
    <Link
      href={loginHref(pathname === "/login" ? null : pathname)}
      className={className}
    >
      {children}
    </Link>
  )
}
