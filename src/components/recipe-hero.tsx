'use client'

import { useState } from 'react'
import { CirclePlay, ExternalLink, ImageOff, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Labels } from '@/lib/recipe-utils'
import type { Recipe } from '@/lib/recipes'

export function RecipeHero({
  recipe,
  labels,
  activeTags,
  onTagClick,
}: {
  recipe: Recipe
  labels: Labels
  activeTags: string[]
  onTagClick: (tag: string) => void
}) {
  const [activeImage, setActiveImage] = useState(0)
  const main = recipe.images[activeImage]
  const category = recipe.category.split('>').map((c) => c.trim()).join(' · ')

  return (
    <section className="grid gap-6 md:grid-cols-[1.05fr_1fr] md:items-center md:gap-10">
      <div className="flex flex-col gap-4 md:order-none">
        <span className="w-fit rounded-full bg-accent px-3 py-1 text-xs font-semibold tracking-wide text-accent-foreground">
          {category}
        </span>
        <div>
          <h1 className="font-serif text-3xl leading-[1.1] font-semibold text-balance sm:text-4xl lg:text-5xl">
            {recipe.title}
          </h1>
          {recipe.hebrew_title && (
            <p dir="auto" className="mt-2 font-serif text-lg text-primary/90 italic sm:text-xl">
              {recipe.hebrew_title}
            </p>
          )}
        </div>
        {recipe.description && (
          <p className="max-w-prose text-base leading-relaxed text-pretty text-muted-foreground">
            {recipe.description}
          </p>
        )}

        <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
          {recipe.tags.map((tag) => {
            const active = activeTags.includes(tag)
            return (
              <li key={tag}>
                <button
                  type="button"
                  dir="auto"
                  aria-pressed={active}
                  onClick={() => onTagClick(tag)}
                  className={cn(
                    'rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
                    active
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
                  )}
                >
                  #{tag}
                </button>
              </li>
            )
          })}
        </ul>

        {(recipe.youtube_url || recipe.original_url) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {recipe.youtube_url && (
              <a
                href={recipe.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3.5 py-1.5 text-sm font-medium text-primary transition-all hover:bg-primary hover:text-primary-foreground"
              >
                <CirclePlay className="size-4" aria-hidden="true" />
                {labels.video}
              </a>
            )}
            {recipe.original_url && (
              <a
                href={recipe.original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground transition-all hover:border-foreground/30 hover:shadow-sm"
              >
                <ExternalLink className="size-4" aria-hidden="true" />
                {labels.source}
              </a>
            )}
          </div>
        )}

        {recipe.before_starting && recipe.before_starting.length > 0 && (
          <div className="mt-2 rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-sm">
            <h3 className="mb-2 font-semibold text-primary text-sm tracking-wide uppercase">Before Starting</h3>
            <ul className="flex flex-col gap-1.5 text-sm text-foreground/80">
              {recipe.before_starting.map((note, i) => (
                 <li key={i} className="flex gap-2">
                   <span className="text-primary mt-0.5">•</span> 
                   <span>{note}</span>
                 </li>
              ))}
              {(() => {
                const totalWaitTime = recipe.instructions?.reduce((total, section) => {
                  return total + section.steps.reduce((secTotal, step) => {
                    return secTotal + (step.wait_time_minutes || 0);
                  }, 0);
                }, 0) || 0;

                if (totalWaitTime > 0) {
                  const formatWaitTime = (minutes: number) => {
                    if (minutes < 60) return `${minutes} minutes`;
                    const h = Math.floor(minutes / 60);
                    const m = minutes % 60;
                    return `${h} hour${h > 1 ? 's' : ''}${m > 0 ? ` ${m} min` : ''}`;
                  };
                  return (
                    <li className="mt-2 flex gap-2 font-medium text-foreground">
                      <span className="text-primary mt-0.5">⏱</span>
                      <span>Total waiting time: {formatWaitTime(totalWaitTime)}</span>
                    </li>
                  )
                }
                return null;
              })()}
            </ul>
          </div>
        )}

        {recipe.tips && recipe.tips.length > 0 && (
          <details className="group mt-2 rounded-xl border border-primary/20 bg-primary/5 shadow-sm">
            <summary className="flex cursor-pointer items-center justify-between p-4 font-semibold text-primary text-sm tracking-wide uppercase list-none [&::-webkit-details-marker]:hidden">
              {labels.tips || 'Tips'}
              <ChevronDown className="size-4 opacity-70 transition-transform group-open:rotate-180" />
            </summary>
            <div className="px-4 pb-4">
              <ul className="flex flex-col gap-1.5 text-sm text-foreground/80">
                {recipe.tips.map((note, i) => (
                   <li key={i} className="flex gap-2">
                     <span className="text-primary mt-0.5">•</span> 
                     <span>{note}</span>
                   </li>
                ))}
              </ul>
            </div>
          </details>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-border/60">
          {main ? (
            <img
              key={main}
              src={main}
              alt={recipe.title}
              className="size-full object-cover animate-in fade-in duration-500"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <ImageOff className="size-8" aria-hidden="true" />
              <span className="sr-only">No image</span>
            </div>
          )}
        </div>
        {recipe.images.length > 1 && (
          <div className="flex gap-2" role="group" aria-label="Photos">
            {recipe.images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => setActiveImage(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-pressed={i === activeImage}
                className={cn(
                  'size-16 overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-background transition-all',
                  i === activeImage ? 'ring-primary' : 'opacity-70 ring-transparent hover:opacity-100',
                )}
              >
                <img src={src} alt="" className="size-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
