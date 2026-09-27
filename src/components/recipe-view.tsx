'use client'

import { cn } from '@/lib/utils'
import { getLabels, isRecipeHebrew } from '@/lib/recipe-utils'
import type { Recipe } from '@/lib/recipes'
import { BatchScaler } from './batch-scaler'
import { IngredientsCard } from './ingredients-card'
import { InstructionsCard } from './instructions-card'
import { RecipeHero } from './recipe-hero'
import { TrialNotes } from './trial-notes'

export function RecipeView({
  recipe,
  scale,
  onScaleChange,
  cookingMode,
  activeTags,
  onTagClick,
}: {
  recipe: Recipe
  scale: number
  onScaleChange: (value: number) => void
  cookingMode: boolean
  activeTags: string[]
  onTagClick: (tag: string) => void
}) {
  const rtl = isRecipeHebrew(recipe)
  const labels = getLabels(rtl)

  return (
    <article
      dir={rtl ? 'rtl' : 'ltr'}
      lang={rtl ? 'he' : 'en'}
      className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 animate-in fade-in slide-in-from-bottom-2 duration-500 sm:px-6 sm:py-10 lg:px-10"
    >
      <RecipeHero recipe={recipe} labels={labels} activeTags={activeTags} onTagClick={onTagClick} />

      <BatchScaler scale={scale} onScaleChange={onScaleChange} labels={labels} />

      <div
        className={cn(
          'grid gap-6',
          cookingMode ? 'lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]' : 'lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]',
        )}
      >
        <div className="lg:sticky lg:top-20 lg:self-start">
          <IngredientsCard
            groups={recipe.ingredients}
            scale={scale}
            labels={labels}
            cookingMode={cookingMode}
          />
        </div>
        <InstructionsCard groups={recipe.instructions} labels={labels} cookingMode={cookingMode} />
      </div>

      <TrialNotes notes={recipe.trial_notes} labels={labels} rtl={rtl} />
    </article>
  )
}
