import { LoginForm } from "./login-form"
import Link from "next/link"
import { theme } from "@/lib/theme"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-theme-primary">
            <img src="/logo.svg" alt="Willamette Technology Club" className="h-10 w-10" />
            Willamette Technology Club
          </Link>
        </div>
        <div className={`${theme.card.className} p-8`}>
          <h2 className={`text-2xl text-center ${theme.text.heading} mb-2`}>
            Welcome
          </h2>
          <p className="text-center text-theme-muted text-sm mb-8">
            Sign in with your GitHub account to continue
          </p>
          <LoginForm />
          <p className="mt-6 text-center text-xs text-theme-muted">
            By signing in, you agree to share your GitHub activity data with Willamette Technology Club members.
          </p>
        </div>
      </div>
    </div>
  )
}
