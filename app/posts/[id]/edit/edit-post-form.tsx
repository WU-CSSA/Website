"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input, Textarea, Button } from "@/components/ui"

interface Post {
  id: string
  title: string
  description: string | null
  content: string
}

export function EditPostForm({ post }: { post: Post }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const content = formData.get("content") as string

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description, content }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to update post")
        return
      }

      router.push(`/posts/${post.id}`)
      router.refresh()
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <Input
        id="title"
        name="title"
        type="text"
        label="Title"
        defaultValue={post.title}
        required
      />

      <Textarea
        id="description"
        name="description"
        rows={2}
        label="Description"
        description="A short summary that appears in post previews"
        defaultValue={post.description || ""}
        required
      />

      <Textarea
        id="content"
        name="content"
        rows={15}
        label="Content"
        description="You can use Markdown formatting (headings, lists, code blocks, etc.)"
        defaultValue={post.content}
        required
        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 font-mono text-sm text-black"
      />

      <div className="flex gap-4">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          Update Post
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  )
}
