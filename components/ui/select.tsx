import { theme } from "@/lib/theme"
import { SelectHTMLAttributes, forwardRef } from "react"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  description?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, description, error, className, children, ...props }, ref) => {
    return (
      <div>
        {label && (
          <label htmlFor={props.id} className={theme.label.className}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`${theme.select.className} ${className || ""}`}
          {...props}
        >
          {children}
        </select>
        {description && (
          <p className="mt-1.5 text-sm text-theme-muted">{description}</p>
        )}
        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = "Select"
