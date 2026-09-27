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
      <div className="flex flex-col mb-10" dir="ltr">
        <div className="hidden flex-col items-start gap-2 text-left lg:flex mt-4 mb-8">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-stone-900 pb-1" dir="auto">
            {heading}
          </h1>
          <p className="text-stone-500 text-lg max-w-xl" dir="auto">{subheading}</p>
        </div>
        
        <div className="hidden lg:block relative w-full mb-8 h-px bg-stone-200">
          <div className="absolute top-0 left-0 h-[3px] -mt-[1px] bg-primary w-24 rounded-full" />
        </div>

        <div className="flex justify-start w-full">
          <div className="w-full text-left">
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
        <div className="flex items-center gap-3 border-b border-border/70 pb-3" dir="ltr">
          <h2 id="feed-heading" className="font-serif text-xl font-semibold lg:text-2xl text-foreground">
            <span className="lg:hidden">{heading}</span>
            <span className="hidden lg:inline">{featured ? 'Recent recipes' : 'Recipes'}</span>
          </h2>
          <span className="text-sm font-medium text-muted-foreground tabular-nums bg-muted/60 px-2.5 py-0.5 rounded-full" aria-live="polite">
            {recipes.length}
          </span>
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
