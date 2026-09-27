'use client'

import { BookOpen, ChevronRight, Folder, FolderOpen, Search, X } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { countRecipes, hasHebrew, type FolderNode } from '@/lib/recipe-utils'
import type { Recipe } from '@/lib/recipes'

type SidebarProps = {
  query: string
  onQueryChange: (value: string) => void
  allTags: string[]
  activeTags: string[]
  onToggleTag: (tag: string) => void
  tree: FolderNode[]
  resultCount: number
  selectedId: string
  onSelect: (id: string) => void
}

export function RecipeSidebar({
  query,
  onQueryChange,
  allTags,
  activeTags,
  onToggleTag,
  tree,
  resultCount,
  selectedId,
  onSelect,
}: SidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <BookOpen className="size-4.5" aria-hidden="true" />
        </span>
        <div className="leading-tight">
          <p className="font-serif text-lg font-semibold">Culinary Notebook</p>
          <p className="text-xs text-muted-foreground">מחברת המתכונים שלי</p>
        </div>
      </div>

      <div className="px-4">
        <label htmlFor="recipe-search" className="sr-only">
          Search recipes, tags, or ingredients
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="recipe-search"
            type="search"
            dir="auto"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search recipes, tags, ingredients…"
            className="h-10 rounded-xl bg-card pr-9 pl-9 shadow-xs"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <div
        className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto px-4 pb-1"
        role="group"
        aria-label="Filter by tag"
      >
        {allTags.map((tag) => {
          const active = activeTags.includes(tag)
          return (
            <button
              key={tag}
              type="button"
              dir="auto"
              aria-pressed={active}
              onClick={() => onToggleTag(tag)}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap transition-all active:scale-95',
                active
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              #{tag}
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-between px-5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        <span>Folders</span>
        <span aria-live="polite">
          {resultCount} {resultCount === 1 ? 'recipe' : 'recipes'}
        </span>
      </div>

      <nav aria-label="Recipe folders" className="mt-2 flex-1 overflow-y-auto px-3 pb-6">
        {tree.length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">
            No recipes match your search.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {tree.map((node) => (
              <FolderItem
                key={node.path}
                node={node}
                depth={0}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
          </ul>
        )}
      </nav>
    </div>
  )
}

function FolderItem({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: FolderNode
  depth: number
  selectedId: string
  onSelect: (id: string) => void
}) {
  return (
    <li>
      <Collapsible defaultOpen>
        <CollapsibleTrigger
          className="group/folder flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-foreground/85 transition-colors hover:bg-sidebar-accent/60"
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
        >
          <ChevronRight
            className="size-3.5 text-muted-foreground transition-transform duration-200 group-data-[panel-open]/folder:rotate-90"
            aria-hidden="true"
          />
          <Folder
            className="size-4 text-primary/80 group-data-[panel-open]/folder:hidden"
            aria-hidden="true"
          />
          <FolderOpen
            className="hidden size-4 text-primary/80 group-data-[panel-open]/folder:block"
            aria-hidden="true"
          />
          <span className="flex-1 truncate text-left">{node.name}</span>
          <span className="rounded-full bg-muted px-1.5 text-[11px] text-muted-foreground tabular-nums">
            {countRecipes(node)}
          </span>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="flex flex-col gap-0.5 py-0.5">
            {node.children.map((child) => (
              <FolderItem
                key={child.path}
                node={child}
                depth={depth + 1}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
            {node.recipes.map((recipe) => (
              <RecipeLink
                key={recipe.id}
                recipe={recipe}
                depth={depth + 1}
                active={recipe.id === selectedId}
                onSelect={onSelect}
              />
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  )
}

function RecipeLink({
  recipe,
  depth,
  active,
  onSelect,
}: {
  recipe: Recipe
  depth: number
  active: boolean
  onSelect: (id: string) => void
}) {
  const rtl = hasHebrew(recipe.title)
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(recipe.id)}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'group flex w-full items-center gap-2.5 rounded-lg py-2 pr-2 text-left text-sm transition-all',
          active
            ? 'bg-card font-medium text-foreground shadow-sm ring-1 ring-border'
            : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground',
        )}
        style={{ paddingLeft: `${depth * 14 + 12}px` }}
      >
        {recipe.images[0] ? (
          <img
            src={recipe.images[0]}
            alt=""
            className="size-7 shrink-0 rounded-md object-cover"
          />
        ) : (
          <span className="size-7 shrink-0 rounded-md bg-muted" aria-hidden="true" />
        )}
        <span dir={rtl ? 'rtl' : 'ltr'} className="line-clamp-2 flex-1 text-start leading-snug">
          {recipe.title}
        </span>
        {active && <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />}
      </button>
    </li>
  )
}
