import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { OnboardingForm } from "./onboarding-form"
import Link from "next/link"
import { theme } from "@/lib/theme"

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const session = await auth()
  const { callbackUrl } = await searchParams

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.hasCompletedOnboarding) {
    redirect(callbackUrl || "/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-theme-bg px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-2xl font-bold text-theme-primary"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white text-sm font-bold">
              CS
            </span>
            CSSA
          </Link>
        </div>
        <div className={`${theme.card.className} p-8`}>
          <h2 className={`text-2xl text-center ${theme.text.heading} mb-2`}>
            Welcome to CSSA!
          </h2>
          <p className="text-center text-theme-muted text-sm mb-8">
            Let&apos;s set up your profile. What would you like to be called?
          </p>
          <OnboardingForm
            defaultName={session.user.name || ""}
            userImage={session.user.image || undefined}
            callbackUrl={callbackUrl}
          />
        </div>
      </div>
    </div>
  )
}
