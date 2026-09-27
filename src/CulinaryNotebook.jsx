import { useState, useMemo } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { RecipeSidebar } from '@/components/recipe-sidebar'
import { RecipeTopBar } from '@/components/recipe-topbar'
import { RecipeView } from '@/components/recipe-view'
import { Menu } from 'lucide-react'

// Helper to build the folder tree UI structure out of flat GitHub paths
function buildTreeFromPaths(files) {
  const root = { name: '', path: '', children: [], recipes: [] }
  for (const file of files) {
    const parts = file.path.split('/')
    let node = root
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      let child = node.children.find(c => c.name === part)
      if (!child) {
        child = { name: part, path: parts.slice(0, i + 1).join('/'), children: [], recipes: [] }
        node.children.push(child)
      }
      node = child
    }
    node.recipes.push({
      id: file.path,
      title: parts[parts.length - 1].replace('.json', '').replace(/-/g, ' '),
      tags: [],
      images: [],
      category: parts[0]
    })
  }
  return root.children
}

export default function CulinaryNotebook({ recipeList, selectedRecipe, activePath, onSelectRecipe }) {
  const [query, setQuery] = useState('')
  const [activeTags, setActiveTags] = useState([])
  const [scale, setScale] = useState(1)
  const [cookingMode, setCookingMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Empty tags until Phase 2 deep search is implemented
  const allTags = []
  
  // Basic search filter by filename path
  const filtered = useMemo(() => {
    if (!query) return recipeList
    return recipeList.filter(f => f.path.toLowerCase().includes(query.toLowerCase()))
  }, [recipeList, query])

  const tree = useMemo(() => buildTreeFromPaths(filtered), [filtered])

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

  function selectRecipe(id) {
    onSelectRecipe(id)
    setScale(1)
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function exportHtml() {
    alert("Export HTML is coming in Phase 3!")
  }

  const sidebar = (
    <RecipeSidebar
      query={query}
      onQueryChange={setQuery}
      allTags={allTags}
      activeTags={activeTags}
      onToggleTag={(t) => {}}
      tree={tree}
      resultCount={filtered.length}
      selectedId={activePath || ''}
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
        {recipe ? (
          <>
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
                onTagClick={(t) => {}}
              />
            </main>
          </>
        ) : (
          <>
            <header className="sticky top-0 z-30 flex h-14 items-center px-3 sm:px-6 lg:hidden border-b border-border/70 bg-background/85 backdrop-blur-md">
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-muted text-foreground"
                aria-label="Open recipe list"
              >
                <Menu className="w-5 h-5" />
              </button>
            </header>
            <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
               {activePath ? 'Loading recipe...' : 'Select a recipe from the menu to view it.'}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
