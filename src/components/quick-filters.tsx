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
      <ul className="flex flex-wrap justify-start gap-3 w-full">
        {active.length > 0 && (
          <li className="shrink-0 flex items-center me-2">
            <button
              type="button"
              onClick={onClear}
              className="text-xs font-medium text-stone-500 hover:text-stone-700 hover:underline"
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
                  'flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-all active:scale-95',
                  isActive
                    ? 'border-orange-700/50 bg-orange-50 text-stone-900 shadow-sm'
                    : 'border-stone-300 bg-transparent text-stone-600 hover:border-orange-700/50 hover:bg-orange-50',
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {label}
                <span
                  className={cn(
                    'text-xs tabular-nums',
                    isActive ? 'text-orange-700/70' : 'text-stone-400',
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
