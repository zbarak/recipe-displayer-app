import { SearchX } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import type { Recipe } from '@/lib/recipes'
import { cn } from '@/lib/utils'
import { FeaturedRecipe } from './featured-recipe'
import { RecipeCard } from './recipe-card'

type DiscoverFeedProps = {
  featured: Recipe | null
  recipes: Recipe[]
  heading: string
  subheading: string
  filters: ReactNode
  emptyTitle: string
  emptyDescription: string
  onOpen: (id: string) => void
  onReset: () => void
}

export function DiscoverFeed({
  featured,
  recipes,
  heading,
  subheading,
  filters,
  emptyTitle,
  emptyDescription,
  onOpen,
  onReset,
}: DiscoverFeedProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-4 py-6 animate-in fade-in duration-300 sm:px-6 lg:gap-10 lg:px-10 lg:py-10">
      <div className="flex flex-col gap-8 lg:gap-10">
        <div className="hidden flex-col items-center gap-3 text-center lg:flex mt-4 mb-2">
          <h1 className="font-serif text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-orange-600 via-amber-600 to-orange-400 drop-shadow-sm pb-1">
            {heading}
          </h1>
          <p className="text-muted-foreground text-lg max-w-md">{subheading}</p>
        </div>
        <div className="flex justify-center w-full">
          <div className="w-full max-w-2xl">
            {filters}
          </div>
        </div>
      </div>

      {featured && (
        <div className="hidden lg:block">
          <FeaturedRecipe recipe={featured} onOpen={onOpen} />
        </div>
      )}

      <section aria-labelledby="feed-heading" className="flex flex-col gap-4 lg:gap-5">
        <div className="flex items-baseline justify-between gap-4 border-b border-border/70 pb-3">
          <h2 id="feed-heading" className="font-serif text-xl font-semibold lg:text-2xl">
            <span className="lg:hidden">{heading}</span>
            <span className="hidden lg:inline">{featured ? 'Recent recipes' : 'Recipes'}</span>
          </h2>
          <p className="text-sm text-muted-foreground tabular-nums" aria-live="polite">
            {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
          </p>
        </div>

        {recipes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
            <SearchX className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="font-medium">{emptyTitle}</p>
            <p className="max-w-xs text-sm text-muted-foreground text-pretty">{emptyDescription}</p>
            <Button variant="outline" onClick={onReset} className="mt-2">
              Show all recipes
            </Button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6 xl:grid-cols-3">
            {recipes.map((recipe) => (
              <li key={recipe.id} className={cn(recipe.id === featured?.id && 'lg:hidden')}>
                <RecipeCard recipe={recipe} onOpen={onOpen} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
