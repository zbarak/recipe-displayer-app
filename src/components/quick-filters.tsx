'use client'

import { Hand, Leaf, MilkOff, Timer, WheatOff, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type QuickFilterTag = 'No Mixer' | 'Vegan' | 'Dairy-Free' | 'Gluten-Free' | 'Quick Recipes'

export const QUICK_FILTERS: { tag: QuickFilterTag; label: string }[] = [
  { tag: 'No Mixer', label: 'No Mixer' },
  { tag: 'Vegan', label: 'Vegan' },
  { tag: 'Dairy-Free', label: 'Dairy-Free' },
  { tag: 'Gluten-Free', label: 'Gluten-Free' },
  { tag: 'Quick Recipes', label: 'Quick Recipes' },
]

const icons: Record<QuickFilterTag, LucideIcon> = {
  'No Mixer': Hand,
  'Vegan': Leaf,
  'Dairy-Free': MilkOff,
  'Gluten-Free': WheatOff,
  'Quick Recipes': Timer,
}

type QuickFiltersProps = {
  active: string[]
  counts: Record<string, number>
  onToggle: (tag: string) => void
  onClear: () => void
}

export function QuickFilters({ active, counts, onToggle, onClear }: QuickFiltersProps) {
  return (
    <div role="group" aria-label="Quick filters" className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">Quick filters</p>
        {active.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 rounded-md text-xs font-medium text-primary hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <ul className="-mx-4 flex scroll-px-4 gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
        {QUICK_FILTERS.map(({ tag, label }) => {
          const Icon = icons[tag]
          const isActive = active.includes(tag)
          const count = counts[tag] ?? 0
          return (
            <li key={tag} className="shrink-0">
              <button
                type="button"
                onClick={() => onToggle(tag)}
                aria-pressed={isActive}
                className={cn(
                  'flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium whitespace-nowrap transition-all active:scale-95',
                  isActive
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'border-border bg-card text-foreground/80 hover:border-foreground/20 hover:text-foreground',
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {label}
                <span
                  className={cn(
                    'text-xs tabular-nums',
                    isActive ? 'text-primary/70' : 'text-muted-foreground',
                  )}
                >
                  {count}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
