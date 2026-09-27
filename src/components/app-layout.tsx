'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  filterRecipes,
  getCategories,
  latestActivity,
  recipeToHtml,
  topCategory,
} from '@/lib/recipe-utils'
import type { Recipe } from '@/lib/recipes'
import { DiscoverFeed } from './discover-feed'
import { DiscoverSidebar } from './discover-sidebar'
import { MobileFeedHeader } from './mobile-feed-header'
import { RecipeTopBar } from './recipe-topbar'
import { RecipeView } from './recipe-view'

export function AppLayout({
  recipes,
  initialRecipeId = null,
}: {
  recipes: Recipe[]
  initialRecipeId?: string | null
}) {
  const [openId, setOpenId] = useState<string | null>(initialRecipeId)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [cookingMode, setCookingMode] = useState(false)
  const feedScrollY = useRef(0)
  const pushedEntry = useRef(false)

  const recent = useMemo(
    () => [...recipes].sort((a, b) => latestActivity(b).localeCompare(latestActivity(a))),
    [recipes],
  )
  const categories = useMemo(() => getCategories(recipes), [recipes])
  const filtered = useMemo(
    () =>
      filterRecipes(recent, query, []).filter((r) => !category || topCategory(r) === category),
    [recent, query, category],
  )

  const recipe = openId ? recipes.find((r) => r.id === openId) ?? null : null
  const isDefaultFeed = !query.trim() && !category
  const featured = isDefaultFeed ? recent[0] ?? null : null

  const heading = query.trim() ? 'Search results' : category ?? 'Discover'
  const subheading = query.trim()
    ? `Matching “${query.trim()}”${category ? ` in ${category}` : ''}`
    : category
      ? `Everything filed under ${category}.`
      : 'Your tested recipes, trial notes, and works in progress.'

  useKeepScreenAwake(cookingMode && recipe !== null)

  useEffect(() => {
    const onPopState = () => {
      const id = new URLSearchParams(window.location.search).get('recipe')
      if (!id) pushedEntry.current = false
      setOpenId(id)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useLayoutEffect(() => {
    window.scrollTo({ top: openId ? 0 : feedScrollY.current })
  }, [openId])

  function openRecipe(id: string) {
    feedScrollY.current = window.scrollY
    setScale(1)
    setOpenId(id)
    window.history.pushState(null, '', `?recipe=${encodeURIComponent(id)}`)
    pushedEntry.current = true
  }

  function goHome() {
    if (!openId) return
    if (pushedEntry.current) {
      window.history.back()
      return
    }
    feedScrollY.current = 0
    window.history.replaceState(null, '', window.location.pathname)
    setOpenId(null)
  }

  function updateQuery(value: string) {
    setQuery(value)
    goHome()
  }

  function selectCategory(value: string | null) {
    setCategory(value)
    feedScrollY.current = 0
    if (openId) goHome()
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetFeed() {
    setQuery('')
    selectCategory(null)
  }

  function searchTag(tag: string) {
    setCategory(null)
    setQuery(tag)
    feedScrollY.current = 0
    goHome()
  }

  function exportHtml() {
    if (!recipe) return
    const blob = new Blob([recipeToHtml(recipe, scale)], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${recipe.id}${scale !== 1 ? `-x${scale}` : ''}.html`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-dvh bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-sidebar-border bg-sidebar lg:block">
        <DiscoverSidebar
          query={query}
          onQueryChange={updateQuery}
          categories={categories}
          totalCount={recipes.length}
          activeCategory={recipe ? null : category}
          onSelectCategory={selectCategory}
          onHome={resetFeed}
        />
      </aside>

      <div className="lg:pl-72">
        {recipe ? (
          <div
            key={recipe.id}
            className="animate-in fade-in slide-in-from-right-8 duration-300 ease-out lg:slide-in-from-right-0"
          >
            <RecipeTopBar
              recipe={recipe}
              cookingMode={cookingMode}
              onToggleCookingMode={() => setCookingMode((v) => !v)}
              onBack={goHome}
              onExport={exportHtml}
            />
            <main>
              <RecipeView
                recipe={recipe}
                scale={scale}
                onScaleChange={setScale}
                cookingMode={cookingMode}
                activeTags={[]}
                onTagClick={searchTag}
              />
            </main>
          </div>
        ) : (
          <>
            <MobileFeedHeader
              query={query}
              onQueryChange={setQuery}
              categories={categories}
              activeCategory={category}
              onSelectCategory={selectCategory}
              onHome={resetFeed}
            />
            <main>
              <DiscoverFeed
                featured={featured}
                recipes={filtered}
                heading={heading}
                subheading={subheading}
                onOpen={openRecipe}
                onReset={resetFeed}
              />
            </main>
          </>
        )}
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
