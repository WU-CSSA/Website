import type { ContentType } from "@prisma/client"
import { MarkdownContent } from "./markdown-content"
import Link from "next/link"

interface ContentRendererProps {
  content: string
  type: ContentType
  title?: string
  resourceType: "post" | "project"
  resourceId: string
}

export function ContentRenderer({
  content,
  type,
  title,
  resourceType,
  resourceId,
}: ContentRendererProps) {
  if (type === "MARKDOWN") {
    return <MarkdownContent content={content} />
  }

  const slidesUrl = `/${resourceType}s/${resourceId}/slides`

  return (
    <div className="space-y-4">
      <div className="bg-theme-secondary/50 rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium text-theme-primary mb-2">
          {title || "Presentation"}
        </h3>
        <p className="text-theme-secondary mb-4">
          This content is a RevealJS presentation.
        </p>
        <Link
          href={slidesUrl}
          target="_blank"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent/90 text-white rounded-lg font-medium transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Open Presentation
        </Link>
        <p className="text-sm text-theme-muted mt-4">
          Opens in a new tab. Use arrow keys to navigate, S for speaker notes, F for fullscreen.
        </p>
      </div>
    </div>
  )
}
