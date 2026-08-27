"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Input, Textarea, Button, Select } from "@/components/ui"
import type { ContentType } from "@prisma/client"

interface Post {
  id: string
  title: string
  description: string | null
  content: string
  type: ContentType
}

export function EditPostForm({ post }: { post: Post }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [contentType, setContentType] = useState<ContentType>(post.type)
  const [content, setContent] = useState(post.content)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const extension = file.name.split(".").pop()?.toLowerCase()

    if (contentType === "REVEAL_MD" && extension !== "md") {
      setError("Please upload a .md file for Markdown presentations")
      return
    }
    if (contentType === "REVEAL_HTML" && extension !== "html" && extension !== "htm") {
      setError("Please upload an .html file for HTML presentations")
      return
    }

    const text = await file.text()
    setContent(text)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const description = formData.get("description") as string

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description, content, type: contentType }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to update post")
        return
      }

      router.push(`/posts/${post.id}`)
      router.refresh()
    } catch {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getContentDescription = () => {
    switch (contentType) {
      case "MARKDOWN":
        return "You can use Markdown formatting (headings, lists, code blocks, etc.)"
      case "REVEAL_MD":
        return "Use --- to separate horizontal slides, -- for vertical slides. Markdown is supported."
      case "REVEAL_HTML":
        return "Paste or upload raw RevealJS HTML. Each <section> is a slide."
    }
  }

  const getFileAccept = () => {
    switch (contentType) {
      case "REVEAL_MD":
        return ".md"
      case "REVEAL_HTML":
        return ".html,.htm"
      default:
        return undefined
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
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

      <Select
        id="type"
        name="type"
        label="Content Type"
        value={contentType}
        onChange={(e) => {
          setContentType(e.target.value as ContentType)
          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }
        }}
        description="Choose the format for your content"
      >
        <option value="MARKDOWN">Markdown</option>
        <option value="REVEAL_MD">RevealJS Presentation (Markdown)</option>
        <option value="REVEAL_HTML">RevealJS Presentation (HTML)</option>
      </Select>

      {(contentType === "REVEAL_MD" || contentType === "REVEAL_HTML") && (
        <div>
          <label className="block text-sm font-medium text-theme-primary mb-1.5">
            Upload File (Optional)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept={getFileAccept()}
            onChange={handleFileUpload}
            className="block w-full text-sm text-theme-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-accent-hover"
          />
          <p className="mt-1.5 text-sm text-theme-muted">
            Or edit content directly in the textarea below
          </p>
        </div>
      )}

      <Textarea
        id="content"
        name="content"
        rows={15}
        label="Content"
        description={getContentDescription()}
        required
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 font-mono text-sm"
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
