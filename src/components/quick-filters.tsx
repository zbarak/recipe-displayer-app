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
    <div role="group" aria-label="Quick filters" className="w-full">
      <ul className="flex flex-wrap justify-center gap-3 mt-4 w-full">
        {active.length > 0 && (
          <li className="shrink-0 flex items-center mr-2">
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-medium text-primary hover:underline"
            >
              Clear filters
            </button>
          </li>
        )}
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
                  'flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-all active:scale-95 hover:bg-stone-100 hover:border-stone-300 dark:hover:bg-stone-800',
                  isActive
                    ? 'border-primary/40 bg-primary/10 text-primary shadow-sm hover:bg-primary/20 hover:border-primary/50'
                    : 'border-border bg-card text-foreground/80',
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
