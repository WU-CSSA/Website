import { theme } from "@/lib/theme"
import { InputHTMLAttributes, forwardRef } from "react"

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <div className="flex items-center">
        <input
          ref={ref}
          type="checkbox"
          className={`${theme.checkbox.className} ${className || ""}`}
          {...props}
        />
        <label htmlFor={props.id} className="ml-2.5 text-sm text-theme-secondary">
          {label}
        </label>
      </div>
    )
  }
)

Checkbox.displayName = "Checkbox"
