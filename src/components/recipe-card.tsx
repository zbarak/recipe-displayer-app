import { Badge } from '@/components/ui/badge'
import { categoryTrail, formatTag } from '@/lib/recipe-utils'
import type { Recipe } from '@/lib/recipes'

const MAX_TAGS = 2

export function RecipeCard({ recipe, onOpen }: { recipe: Recipe; onOpen: (id: string) => void }) {
  const visibleTags = recipe.tags.slice(0, MAX_TAGS)
  const hiddenCount = recipe.tags.length - visibleTags.length

  return (
    <button
      type="button"
      onClick={() => onOpen(recipe.id)}
      className="group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-card text-start shadow-[0_1px_2px_oklch(0.22_0.012_50/0.05),0_10px_30px_-18px_oklch(0.22_0.012_50/0.25)] ring-1 ring-foreground/6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_2px_4px_oklch(0.22_0.012_50/0.05),0_24px_48px_-20px_oklch(0.22_0.012_50/0.35)] hover:ring-foreground/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.99]"
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {recipe.images[0] && (
          <img
            src={recipe.images[0]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-5 sm:p-6" dir="ltr">
        <p className="text-xs font-medium tracking-wider text-primary uppercase">
          {categoryTrail(recipe)}
        </p>
        <h3 dir="auto" className="font-serif text-lg leading-snug font-semibold text-balance">
          {recipe.title}
        </h3>
        {recipe.description && (
          <p dir="auto" className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {recipe.description}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
          {visibleTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="capitalize">
              {formatTag(tag)}
            </Badge>
          ))}
          {hiddenCount > 0 && (
            <Badge variant="outline" aria-label={`${hiddenCount} more tags`}>
              +{hiddenCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  )
}
