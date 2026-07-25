import { theme } from "@/lib/theme"
import { TextareaHTMLAttributes, forwardRef } from "react"

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  description?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, description, error, className, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={props.id} className={theme.label.className}>
            {label}
          </label>
        )}
        {description && (
          <p className="text-sm text-theme-muted mb-2">{description}</p>
        )}
        <textarea
          ref={ref}
          className={`${theme.textarea.className} ${className || ""}`}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = "Textarea"
