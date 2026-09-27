import { ArrowRight, Sparkles } from 'lucide-react'
import { categoryTrail } from '@/lib/recipe-utils'
import type { Recipe } from '@/lib/recipes'

export function FeaturedRecipe({ recipe, onOpen }: { recipe: Recipe; onOpen: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(recipe.id)}
      className="group relative isolate flex aspect-[21/9] min-h-80 w-full flex-col justify-end overflow-hidden rounded-3xl text-start shadow-[0_30px_60px_-30px_oklch(0.22_0.012_50/0.45)] focus-visible:ring-4 focus-visible:ring-ring/40 focus-visible:outline-none"
    >
      {recipe.images[0] && (
        <img
          src={recipe.images[0]}
          alt=""
          className="-z-10 absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
        />
      )}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/30 to-black/0"
        aria-hidden="true"
      />

      <div className="flex max-w-2xl flex-col gap-3 p-8 text-white xl:p-10" dir="ltr">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-wide backdrop-blur-md">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Featured · {categoryTrail(recipe)}
        </span>
        <h2 dir="auto" className="font-serif text-4xl leading-tight font-semibold text-balance xl:text-5xl">
          {recipe.title}
        </h2>
        {recipe.description && (
          <p dir="auto" className="line-clamp-2 text-base leading-relaxed text-pretty text-white/80">
            {recipe.description}
          </p>
        )}
        <span className="mt-2 inline-flex h-10 w-fit items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-foreground shadow-sm transition-all group-hover:gap-3">
          View recipe
          <ArrowRight className="size-4" aria-hidden="true" />
        </span>
      </div>
    </button>
  )
}
