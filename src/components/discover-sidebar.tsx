'use client'

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { CategoryCount } from '@/lib/recipe-utils'
import { cn } from '@/lib/utils'
import { AppLogo } from './app-logo'
import { CategoryIcon } from './category-icon'

type DiscoverSidebarProps = {
  query: string
  onQueryChange: (value: string) => void
  categories: CategoryCount[]
  totalCount: number
  activeCategory: string | null
  onSelectCategory: (category: string | null) => void
  onHome: () => void
}

export function DiscoverSidebar({
  query,
  onQueryChange,
  categories,
  totalCount,
  activeCategory,
  onSelectCategory,
  onHome,
}: DiscoverSidebarProps) {
  const items: { name: string | null; label: string; count: number }[] = [
    { name: null, label: 'All recipes', count: totalCount },
    ...categories.map((c) => ({ name: c.name, label: c.name, count: c.count })),
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6 pb-5">
        <AppLogo onClick={onHome} />
      </div>

      <div className="px-4">
        <label htmlFor="sidebar-search" className="sr-only">
          Search recipes, tags, or ingredients
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="sidebar-search"
            type="search"
            dir="auto"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search recipes…"
            className="h-10 rounded-xl bg-background pr-9 pl-9 shadow-xs [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <nav aria-label="Categories" className="mt-7 flex-1 overflow-y-auto px-3">
        <p className="px-2 pb-2 text-xs font-medium tracking-wider text-muted-foreground uppercase">
          Categories
        </p>
        <ul className="flex flex-col gap-0.5">
          {items.map((item) => {
            const active = activeCategory === item.name
            return (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => onSelectCategory(item.name)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm transition-colors',
                    active
                      ? 'bg-card font-medium text-foreground shadow-xs ring-1 ring-foreground/6'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  )}
                >
                  <CategoryIcon
                    name={item.name}
                    className={cn('size-4', active ? 'text-primary' : 'text-muted-foreground')}
                  />
                  <span className="flex-1 truncate text-start">{item.label}</span>
                  <span
                    className={cn(
                      'min-w-5 rounded-full px-1.5 text-center text-xs tabular-nums',
                      item.count === 0 ? 'text-muted-foreground/50' : 'text-muted-foreground',
                      active && 'bg-primary/10 text-primary',
                    )}
                  >
                    {item.count}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <p className="border-t border-sidebar-border px-5 py-4 text-xs text-muted-foreground text-left" dir="ltr">
        {totalCount} recipes in your notebook
      </p>
    </div>
  )
}
