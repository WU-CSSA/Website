import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { theme } from "@/lib/theme"
import { FormBuilder } from "@/components/form-builder"

export default async function NewFormPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }
  if (!session.user.isAdmin) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-theme-bg py-12">
      <div className={`${theme.container} max-w-3xl`}>
        <h1 className={`text-3xl ${theme.text.heading} mb-8`}>New Form</h1>
        <FormBuilder />
      </div>
    </div>
  )
}
