"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "./ui"

interface DeleteButtonProps {
  id: string
  type: "post" | "event" | "project"
  redirectTo: string
}

export function DeleteButton({ id, type, redirectTo }: DeleteButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/${type}s/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        alert("Failed to delete. Please try again.")
        return
      }

      router.push(redirectTo)
      router.refresh()
    } catch (error) {
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
          onClick={handleDelete}
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
    <Button
      variant="danger"
      onClick={() => setShowConfirm(true)}
    >
      Delete
    </Button>
  )
}
