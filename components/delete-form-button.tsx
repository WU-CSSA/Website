"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "./ui"

export function DeleteFormButton({ id }: { id: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleDelete(force: boolean) {
    setIsDeleting(true)
    try {
      const res = await fetch(
        `/api/forms/${id}${force ? "?force=true" : ""}`,
        { method: "DELETE" }
      )

      if (res.status === 409) {
        const data = await res.json()
        if (
          window.confirm(
            `${data.error}\n\nDelete the form and all its responses anyway?`
          )
        ) {
          await handleDelete(true)
          return
        }
        return
      }

      if (!res.ok) {
        alert("Failed to delete the form. Please try again.")
        return
      }

      router.push("/admin/forms")
      router.refresh()
    } catch {
      alert("An error occurred. Please try again.")
    } finally {
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex gap-2">
        <Button
          variant="danger"
          onClick={() => handleDelete(false)}
          isLoading={isDeleting}
        >
          Confirm Delete
        </Button>
        <Button
          variant="secondary"
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
        >
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <Button variant="danger" onClick={() => setShowConfirm(true)}>
      Delete
    </Button>
  )
}
