"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input, Textarea, Button, Checkbox } from "@/components/ui"

export function CreateProjectForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [technologies, setTechnologies] = useState<string[]>([])
  const [techInput, setTechInput] = useState("")

  function addTechnology() {
    const tech = techInput.trim()
    if (tech && !technologies.includes(tech)) {
      setTechnologies([...technologies, tech])
      setTechInput("")
    }
  }

  function removeTechnology(tech: string) {
    setTechnologies(technologies.filter((t) => t !== tech))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault()
      addTechnology()
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const content = formData.get("content") as string
    const imageUrl = formData.get("imageUrl") as string
    const githubUrl = formData.get("githubUrl") as string
    const demoUrl = formData.get("demoUrl") as string
    const featured = formData.get("featured") === "on"

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          content,
          imageUrl,
          githubUrl,
          demoUrl,
          technologies,
          featured,
          authorId: userId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to create project")
        return
      }

      const data = await response.json()
      router.push(`/projects/${data.project.id}`)
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
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <Input id="title" name="title" type="text" label="Title" required />

      <Textarea
        id="description"
        name="description"
        rows={2}
        label="Description"
        description="A short summary that appears in project previews"
        required
      />

      <div>
        <Input id="imageUrl" name="imageUrl" type="url" label="Image URL" />
        <p className="mt-1.5 text-sm text-theme-muted">
          URL to a cover image for the project (optional)
        </p>
      </div>

      <div>
        <Input id="githubUrl" name="githubUrl" type="url" label="GitHub URL" />
        <p className="mt-1.5 text-sm text-theme-muted">
          Link to the project&apos;s source code (optional)
        </p>
      </div>

      <div>
        <Input id="demoUrl" name="demoUrl" type="url" label="Demo URL" />
        <p className="mt-1.5 text-sm text-theme-muted">
          Link to a live demo of the project (optional)
        </p>
      </div>

      {/* Technologies */}
      <div>
        <label className="block text-sm font-medium text-theme-primary mb-1.5">
          Technologies
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a technology"
            className="flex-1 rounded-lg border border-theme-border bg-theme-input px-4 py-2.5 text-theme-primary placeholder-theme-muted shadow-sm transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
          <Button type="button" variant="secondary" onClick={addTechnology}>
            Add
          </Button>
        </div>
        {technologies.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-accent/10 text-accent"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => removeTechnology(tech)}
                  className="hover:text-accent-hover"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="mt-1.5 text-sm text-theme-muted">
          Press Enter or click Add to add technologies
        </p>
      </div>

      <Textarea
        id="content"
        name="content"
        rows={15}
        label="Content"
        description="Detailed description of the project. You can use Markdown formatting."
        required
      />

      <Checkbox id="featured" name="featured" label="Featured project" />

      <div className="flex gap-4">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          Create Project
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
