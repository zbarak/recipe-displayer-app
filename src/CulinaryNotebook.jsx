import { useState, useMemo, useEffect } from 'react'
import { DiscoverSidebar } from '@/components/discover-sidebar'
import { MobileFeedHeader } from '@/components/mobile-feed-header'
import { DiscoverFeed } from '@/components/discover-feed'
import { RecipeTopBar } from '@/components/recipe-topbar'
import { RecipeView } from '@/components/recipe-view'
import { QuickFilters } from '@/components/quick-filters'

export default function CulinaryNotebook({ recipeList, selectedRecipe, activePath, onSelectRecipe }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(null)
  const [activeTags, setActiveTags] = useState([])
  const [scale, setScale] = useState(1)
  const [cookingMode, setCookingMode] = useState(false)

  // 1. We now have complete metadata for all recipes from _index.json
  const allRecipes = recipeList || []

  // 2. Derive unique categories and counts
  const categories = useMemo(() => {
    const counts = {}
    for (const r of allRecipes) {
      counts[r.category] = (counts[r.category] || 0) + 1
    }
    return Object.entries(counts).map(([name, count]) => ({ name, count }))
  }, [allRecipes])

  // 3. Filter recipes
  const filtered = useMemo(() => {
    let result = allRecipes
    if (category) {
      result = result.filter(r => r.category === category)
    }
    if (activeTags.length > 0) {
      result = result.filter(r => activeTags.every(t => (r.tags || []).includes(t)))
    }
    if (query) {
      const q = query.toLowerCase()
      result = result.filter(r => r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q))
    }
    return result
  }, [allRecipes, category, query, activeTags])

  // 4. Compute tag counts for the QuickFilters (based on the current filtered list, but ignoring the tags themselves so you can see what's available)
  const tagCounts = useMemo(() => {
    let baseList = allRecipes
    if (category) baseList = baseList.filter(r => r.category === category)
    if (query) {
      const q = query.toLowerCase()
      baseList = baseList.filter(r => r.title.toLowerCase().includes(q) || r.category.toLowerCase().includes(q))
    }
    const counts = {}
    for (const r of baseList) {
      for (const t of (r.tags || [])) {
        counts[t] = (counts[t] || 0) + 1
      }
    }
    return counts
  }, [allRecipes, category, query])

  const heading = query.trim() ? 'Search results' : category ?? 'Discover'
  const subheading = query.trim()
    ? `Matching “${query.trim()}”${category ? ` in ${category}` : ''}`
    : category
      ? `Everything filed under ${category}.`
      : 'Your tested recipes and works in progress.'

  const resetFeed = () => {
    setQuery('')
    setCategory(null)
    setActiveTags([])
  }
  
  const searchTag = (tag) => {
    setCategory(null)
    setQuery(tag)
    onSelectRecipe(null)
  }

  function goHome() {
    onSelectRecipe(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function exportHtml() {
    alert("Export HTML is coming in Phase 3!")
  }

  const normalizedSelectedRecipe = selectedRecipe ? { ...selectedRecipe } : null;
  if (normalizedSelectedRecipe && normalizedSelectedRecipe.instructions) {
    normalizedSelectedRecipe.instructions = normalizedSelectedRecipe.instructions.map(section => ({
      ...section,
      steps: section.steps ? section.steps.map(step => 
        typeof step === 'string' ? { text: step, image: "" } : step
      ) : []
    }));
  }

  const recipe = normalizedSelectedRecipe ? {
    title: "",
    category: "",
    description: "",
    tags: [],
    images: [],
    ingredients: [],
    instructions: [],
    trial_notes: [],
    ...normalizedSelectedRecipe,
    id: activePath
  } : null

  // Ensure scroll top on recipe load
  useEffect(() => {
    if (activePath) {
      window.scrollTo({ top: 0 })
    }
  }, [activePath])

  return (
    <div className="min-h-dvh bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-sidebar-border bg-sidebar lg:block">
        <DiscoverSidebar
          query={query}
          onQueryChange={setQuery}
          categories={categories}
          totalCount={recipeList.length}
          activeCategory={recipe ? null : category}
          onSelectCategory={(c) => { setCategory(c); onSelectRecipe(null); }}
          onHome={resetFeed}
        />
      </aside>

      <div className="lg:pl-72">
        {recipe ? (
          <div key={recipe.id} className="animate-in fade-in slide-in-from-right-8 duration-300 ease-out lg:slide-in-from-right-0">
            <RecipeTopBar
              recipe={recipe}
              cookingMode={cookingMode}
              onToggleCookingMode={() => setCookingMode((v) => !v)}
              onBack={goHome}
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
              onSelectCategory={setCategory}
              onHome={resetFeed}
            />
            <main>
              <DiscoverFeed
                featured={null}
                recipes={filtered}
                heading={heading}
                subheading={subheading}
                filters={
                  <QuickFilters 
                    active={activeTags} 
                    counts={tagCounts} 
                    onToggle={(t) => setActiveTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])} 
                    onClear={() => setActiveTags([])} 
                  />
                }
                emptyTitle="No recipes found"
                emptyDescription="Try adjusting your search or filters."
                onOpen={(id) => {
                  onSelectRecipe(id);
                }}
                onReset={resetFeed}
              />
            </main>
          </>
        )}
      </div>
    </div>
  )
}
