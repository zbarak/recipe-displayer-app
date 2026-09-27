import { BookOpen } from 'lucide-react'

export function AppLogo({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-xl text-start transition-transform active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      aria-label="Culinary Notebook, go to Discover"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <BookOpen className="size-4.5" aria-hidden="true" />
      </span>
      <span className="leading-tight">
        <span className="block font-serif text-lg font-semibold">Culinary Notebook</span>
        <span className="block text-xs text-muted-foreground">מחברת המתכונים שלי</span>
      </span>
    </button>
  )
}
