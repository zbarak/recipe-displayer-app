'use client'

import { useState } from 'react'
import { Check, ChefHat, CirclePlay, Download, ExternalLink, Menu, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Recipe } from '@/lib/recipes'

type TopBarProps = {
  recipe: Recipe
  cookingMode: boolean
  onToggleCookingMode: () => void
  onOpenSidebar: () => void
  onExport: () => void
}

export function RecipeTopBar({
  recipe,
  cookingMode,
  onToggleCookingMode,
  onOpenSidebar,
  onExport,
}: TopBarProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: recipe.title, text: recipe.description, url })
        return
      } catch {
        // User dismissed the native share sheet; fall through to copy.
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      onExport()
    }
  }

  const crumbs = recipe.category.split('>').map((c) => c.trim())

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="flex h-14 items-center gap-2 px-3 sm:px-6">
        <Button
          variant="ghost"
          size="icon-lg"
          className="lg:hidden"
          onClick={onOpenSidebar}
          aria-label="Open recipe list"
        >
          <Menu className="size-5" />
        </Button>

        <nav aria-label="Breadcrumb" className="hidden min-w-0 flex-1 sm:block">
          <ol className="flex items-center gap-1.5 truncate text-sm text-muted-foreground">
            {crumbs.map((c, i) => (
              <li key={c} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden="true">/</span>}
                <span>{c}</span>
              </li>
            ))}
          </ol>
        </nav>
        <div className="flex-1 sm:hidden" />

        <div className="flex items-center gap-1.5">
          {recipe.youtube_url && (
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:inline-flex"
              nativeButton={false}
              render={<a href={recipe.youtube_url} target="_blank" rel="noopener noreferrer" />}
            >
              <CirclePlay />
              Video
            </Button>
          )}
          {recipe.original_url && (
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:inline-flex"
              nativeButton={false}
              render={<a href={recipe.original_url} target="_blank" rel="noopener noreferrer" />}
            >
              <ExternalLink />
              Source
            </Button>
          )}

          <Button
            variant="outline"
            size="icon-lg"
            onClick={handleShare}
            aria-label={copied ? 'Link copied' : 'Share recipe'}
            className="bg-card"
          >
            {copied ? <Check className="text-primary" /> : <Share2 />}
          </Button>
          <Button variant="outline" onClick={onExport} className="h-9 bg-card px-3">
            <Download />
            <span className="hidden sm:inline">Export HTML</span>
            <span className="sr-only sm:hidden">Export HTML</span>
          </Button>
          <Button
            onClick={onToggleCookingMode}
            aria-pressed={cookingMode}
            className={cn(
              'h-9 px-3 transition-all',
              cookingMode
                ? 'bg-primary text-primary-foreground shadow-md ring-4 ring-primary/15'
                : 'border-border bg-foreground text-background hover:bg-foreground/90',
            )}
          >
            <ChefHat />
            <span className="hidden sm:inline">{cookingMode ? 'Cooking…' : 'Cooking Mode'}</span>
            <span className="sr-only sm:hidden">Cooking Mode</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
