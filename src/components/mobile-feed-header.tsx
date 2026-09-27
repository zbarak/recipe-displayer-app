'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { CategoryCount } from '@/lib/recipe-utils'
import { cn } from '@/lib/utils'
import { AppLogo } from './app-logo'
import { CategoryIcon } from './category-icon'

type MobileFeedHeaderProps = {
  query: string
  onQueryChange: (value: string) => void
  categories: CategoryCount[]
  activeCategory: string | null
  onSelectCategory: (category: string | null) => void
  onHome: () => void
}

export function MobileFeedHeader({
  query,
  onQueryChange,
  categories,
  activeCategory,
  onSelectCategory,
  onHome,
}: MobileFeedHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(query !== '')
  const chips: (string | null)[] = [null, ...categories.map((c) => c.name)]

  function closeSearch() {
    onQueryChange('')
    setSearchOpen(false)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl lg:hidden">
      <div className="flex h-16 items-center justify-between gap-3 px-4">
        <AppLogo onClick={onHome} />
        <Button
          variant="ghost"
          size="icon-lg"
          className="rounded-full"
          onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
          aria-label={searchOpen ? 'Close search' : 'Search recipes'}
          aria-expanded={searchOpen}
          aria-controls="mobile-search"
        >
          {searchOpen ? <X className="size-5" /> : <Search className="size-5" />}
        </Button>
      </div>

      {searchOpen && (
        <div className="px-4 pb-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <label htmlFor="mobile-search" className="sr-only">
            Search recipes, tags, or ingredients
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="mobile-search"
              type="search"
              dir="auto"
              autoFocus
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search recipes, tags, ingredients…"
              className="h-11 rounded-full bg-card pl-10 text-base shadow-xs"
            />
          </div>
        </div>
      )}

      <nav
        aria-label="Categories"
        className="[mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-24px),transparent)]"
      >
        <ul className="flex snap-x snap-proximity scroll-px-4 gap-2 overflow-x-auto px-4 pt-3 pb-4 [scrollbar-width:none] after:w-2 after:shrink-0 after:content-[''] [&::-webkit-scrollbar]:hidden">
          {chips.map((name) => {
            const active = activeCategory === name
            return (
              <li key={name ?? 'all'} className="shrink-0 snap-start">
                <button
                  type="button"
                  onClick={() => onSelectCategory(name)}
                  aria-pressed={active}
                  className={cn(
                    'flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-all active:scale-95',
                    active
                      ? 'bg-foreground text-background shadow-sm'
                      : 'bg-card text-foreground/80 ring-1 ring-foreground/8',
                  )}
                >
                  <CategoryIcon name={name} className="size-4" />
                  {name ?? 'All'}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}
