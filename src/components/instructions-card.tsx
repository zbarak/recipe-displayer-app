'use client'

import { useState } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Labels } from '@/lib/recipe-utils'
import type { InstructionGroup } from '@/lib/recipes'

export function InstructionsCard({
  groups,
  labels,
  cookingMode,
}: {
  groups: InstructionGroup[]
  labels: Labels
  cookingMode: boolean
}) {
  const [done, setDone] = useState<Set<string>>(new Set())

  const flat = groups.flatMap((g, gi) => g.steps.map((_, si) => `${gi}-${si}`))
  const total = flat.length
  const currentKey = flat.find((k) => !done.has(k))
  const progress = total ? (done.size / total) * 100 : 0

  function toggle(key: string) {
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  let stepNumber = 0

  return (
    <section
      aria-labelledby="instructions-heading"
      className={cn(
        'rounded-2xl border bg-card p-5 shadow-sm transition-colors sm:p-6',
        cookingMode ? 'border-primary/30 ring-4 ring-primary/5' : 'border-border',
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 id="instructions-heading" className="font-serif text-2xl font-semibold">
          {labels.instructions}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground tabular-nums">
            <bdi>
              {done.size}/{total}
            </bdi>{' '}
            {labels.steps}
          </span>
          {done.size > 0 && (
            <button
              type="button"
              onClick={() => setDone(new Set())}
              className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <RotateCcw className="size-3" aria-hidden="true" />
              {labels.reset}
            </button>
          )}
        </div>
      </div>

      <div
        className="mb-5 h-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={done.size}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={labels.instructions}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out rtl:ms-auto"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-col gap-6">
        {groups.map((group, gi) => (
          <div key={group.section ?? gi}>
            {group.section && (
              <h3 className="mb-2 text-xs font-semibold tracking-wider text-primary uppercase">
                {group.section}
              </h3>
            )}
            <ol className="flex flex-col gap-1.5">
              {group.steps.map((step, si) => {
                const key = `${gi}-${si}`
                const isDone = done.has(key)
                const isCurrent = cookingMode && key === currentKey
                stepNumber += 1
                return (
                  <li key={key}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isDone}
                      aria-label={`${labels.step} ${stepNumber}`}
                      onClick={() => toggle(key)}
                      className={cn(
                        'group flex w-full gap-3.5 rounded-xl p-3 text-start transition-all',
                        isCurrent ? 'bg-accent/60 ring-1 ring-primary/30' : 'hover:bg-muted/60',
                      )}
                    >
                      <span
                        className={cn(
                          'flex shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold tabular-nums transition-all',
                          cookingMode ? 'size-9 text-sm' : 'size-7',
                          isDone
                            ? 'border-primary bg-primary text-primary-foreground'
                            : isCurrent
                              ? 'border-primary text-primary'
                              : 'border-input text-muted-foreground group-hover:border-primary/50',
                        )}
                        aria-hidden="true"
                      >
                        {isDone ? <Check className="size-4" /> : stepNumber}
                      </span>
                      <span className="flex flex-1 flex-col gap-3">
                        {step.title && (
                          <h4 className="font-semibold text-foreground/90">{step.title}</h4>
                        )}
                        <span
                          className={cn(
                            'leading-relaxed text-pretty transition-all',
                            cookingMode ? 'pt-1 text-xl' : 'pt-0.5 text-[15px]',
                            isDone && 'text-muted-foreground/70 line-through decoration-primary/30',
                          )}
                        >
                          {step.text}
                        </span>
                        {step.wait_time_minutes > 0 && (
                          <span className="inline-flex items-center gap-1.5 w-fit rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                            <span aria-hidden="true">⏱</span> 
                            Wait time: {step.wait_time_minutes < 60 ? `${step.wait_time_minutes} minutes` : `${Math.floor(step.wait_time_minutes / 60)} hour${Math.floor(step.wait_time_minutes / 60) > 1 ? 's' : ''}${step.wait_time_minutes % 60 > 0 ? ` ${step.wait_time_minutes % 60} min` : ''}`}
                          </span>
                        )}
                        {step.image && (
                          <div className="flex flex-wrap justify-center gap-3 w-full">
                            {(Array.isArray(step.image) ? step.image : [step.image])
                              .filter(Boolean)
                              .map((imgUrl, idx) => (
                                <img
                                  key={idx}
                                  src={imgUrl}
                                  alt=""
                                  className={cn(
                                    'h-auto w-full max-w-sm rounded-xl ring-1 ring-border transition-opacity',
                                    isDone && 'opacity-50',
                                  )}
                                />
                              ))}
                          </div>
                        )}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>
        ))}
      </div>
    </section>
  )
}
