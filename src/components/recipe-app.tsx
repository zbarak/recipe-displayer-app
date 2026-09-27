'use client'

import { useEffect, useMemo, useState } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { buildFolderTree, filterRecipes, recipeToHtml } from '@/lib/recipe-utils'
import type { Recipe } from '@/lib/recipes'
import { RecipeSidebar } from './recipe-sidebar'
import { RecipeTopBar } from './recipe-topbar'
import { RecipeView } from './recipe-view'

export function RecipeApp({ recipes }: { recipes: Recipe[] }) {
  const [selectedId, setSelectedId] = useState(recipes[0]?.id ?? '')
  const [query, setQuery] = useState('')
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [scale, setScale] = useState(1)
  const [cookingMode, setCookingMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const allTags = useMemo(() => Array.from(new Set(recipes.flatMap((r) => r.tags))), [recipes])
  const filtered = useMemo(
    () => filterRecipes(recipes, query, activeTags),
    [recipes, query, activeTags],
  )
  const tree = useMemo(() => buildFolderTree(filtered), [filtered])
  const recipe = recipes.find((r) => r.id === selectedId) ?? recipes[0]

  useKeepScreenAwake(cookingMode)

  function toggleTag(tag: string) {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  function selectRecipe(id: string) {
    setSelectedId(id)
    setScale(1)
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function exportHtml() {
    const blob = new Blob([recipeToHtml(recipe, scale)], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${recipe.id}${scale !== 1 ? `-x${scale}` : ''}.html`
    link.click()
    URL.revokeObjectURL(url)
  }

  const sidebar = (
    <RecipeSidebar
      query={query}
      onQueryChange={setQuery}
      allTags={allTags}
      activeTags={activeTags}
      onToggleTag={toggleTag}
      tree={tree}
      resultCount={filtered.length}
      selectedId={recipe.id}
      onSelect={selectRecipe}
    />
  )

  return (
    <div className="min-h-dvh bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-80 border-r border-sidebar-border bg-sidebar lg:block">
        {sidebar}
      </aside>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[88%] max-w-sm gap-0 bg-sidebar p-0">
          <SheetTitle className="sr-only">Recipes</SheetTitle>
          <SheetDescription className="sr-only">
            Search and browse recipes by folder or tag.
          </SheetDescription>
          {sidebar}
        </SheetContent>
      </Sheet>

      <div className="lg:pl-80">
        <RecipeTopBar
          recipe={recipe}
          cookingMode={cookingMode}
          onToggleCookingMode={() => setCookingMode((v) => !v)}
          onOpenSidebar={() => setSidebarOpen(true)}
          onExport={exportHtml}
        />
        <main>
          <RecipeView
            key={recipe.id}
            recipe={recipe}
            scale={scale}
            onScaleChange={setScale}
            cookingMode={cookingMode}
            activeTags={activeTags}
            onTagClick={toggleTag}
          />
        </main>
      </div>
    </div>
  )
}

function useKeepScreenAwake(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    let cancelled = false

    const request = () =>
      navigator.wakeLock
        .request('screen')
        .then((l) => {
          if (cancelled) l.release()
          else lock = l
        })
        .catch(() => {})

    const onVisible = () => {
      if (document.visibilityState === 'visible') request()
    }

    request()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      lock?.release().catch(() => {})
    }
  }, [enabled])
}
