"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input, Textarea, Button } from "@/components/ui"

export function CreateEventForm({ userId }: { userId: string }) {
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
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string
    const location = formData.get("location") as string

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          content,
          startDate,
          endDate: endDate || null,
          location: location || null,
          authorId: userId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to create event")
        return
      }

      const data = await response.json()
      router.push(`/events/${data.event.id}`)
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
        label="Event Title"
        required
      />

      <Textarea
        id="description"
        name="description"
        rows={3}
        label="Short Description"
        placeholder="A brief summary of the event"
        required
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input
          id="startDate"
          name="startDate"
          type="datetime-local"
          label="Start Date & Time"
          required
        />

        <Input
          id="endDate"
          name="endDate"
          type="datetime-local"
          label="End Date & Time (Optional)"
        />
      </div>

      <Input
        id="location"
        name="location"
        type="text"
        label="Location (Optional)"
        placeholder="Room 123, Main Building"
      />

      <Textarea
        id="content"
        name="content"
        rows={12}
        label="Full Event Details"
        description="You can use Markdown formatting for the event details page"
        placeholder="## About&#10;Details about the event...&#10;&#10;## Agenda&#10;- Topic 1&#10;- Topic 2"
        required
        className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-900 focus:outline-none focus:ring-gray-900 font-mono text-sm text-black"
      />

      <div className="flex gap-4">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          Create Event
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  )
}
