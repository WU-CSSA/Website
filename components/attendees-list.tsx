import { theme } from "@/lib/theme"

interface Attendee {
  id: string
  displayName: string | null
  image: string | null
  checkedInAt: string
}

interface AttendeesListProps {
  attendees: Attendee[]
}

export function AttendeesList({ attendees }: AttendeesListProps) {
  if (attendees.length === 0) {
    return (
      <div className={`${theme.card.className} p-6`}>
        <p className="text-sm text-theme-muted text-center">
          No attendees checked in yet
        </p>
      </div>
    )
  }

  return (
    <div className={`${theme.card.className} p-6`}>
      <h3 className={`text-sm font-medium ${theme.text.heading} mb-4`}>
        Attendees ({attendees.length})
      </h3>
      <ul className="space-y-3">
        {attendees.map((attendee) => (
          <li key={attendee.id} className="flex items-center gap-3">
            {attendee.image ? (
              <img
                src={attendee.image}
                alt={attendee.displayName || "User"}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-medium text-sm">
                {(attendee.displayName || "U")[0].toUpperCase()}
              </div>
            )}
            <span className="text-sm text-theme-primary">
              {attendee.displayName || "Anonymous"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
