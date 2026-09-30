'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatAmount, translateUnit, type Labels } from '@/lib/recipe-utils'
import type { IngredientGroup } from '@/lib/recipes'

export function IngredientsCard({
  groups,
  scale,
  labels,
  cookingMode,
  rtl,
}: {
  groups: IngredientGroup[]
  scale: number
  labels: Labels
  cookingMode: boolean
  rtl: boolean
}) {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const total = groups.reduce((sum, g) => sum + g.items.length, 0)

  function toggle(key: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <section
      aria-labelledby="ingredients-heading"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"
    >
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h2 id="ingredients-heading" className="font-serif text-2xl font-semibold">
          {labels.ingredients}
        </h2>
        <span className="text-xs text-muted-foreground tabular-nums">
          <bdi>
            {checked.size}/{total}
          </bdi>{' '}
          {labels.items}
        </span>
      </div>

      <div className="flex flex-col gap-5">
        {groups.map((group, gi) => (
          <div key={group.section ?? gi}>
            {group.section && (
              <h3 className="mb-1.5 text-xs font-semibold tracking-wider text-primary uppercase">
                {group.section}
              </h3>
            )}
            <ul className="flex flex-col">
              {group.items.map((item, ii) => {
                const key = `${gi}-${ii}`
                const done = checked.has(key)
                return (
                  <li key={key}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={done}
                      onClick={() => toggle(key)}
                      className={cn(
                        'group flex w-full items-center gap-3 rounded-lg border-b border-dashed border-border/80 px-1 text-start transition-colors last:border-0 hover:bg-muted/60',
                        cookingMode ? 'py-3.5 text-lg' : 'py-2.5 text-[15px]',
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-5 shrink-0 items-center justify-center rounded-md border transition-all',
                          done
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-input bg-background group-hover:border-primary/50',
                        )}
                        aria-hidden="true"
                      >
                        <Check className={cn('size-3.5 transition-transform', done ? 'scale-100' : 'scale-0')} />
                      </span>
                      <span
                        className={cn(
                          'flex min-w-[5.5rem] shrink-0 flex-col items-start justify-center font-semibold text-foreground tabular-nums transition-opacity',
                          done && 'opacity-40',
                        )}
                      >
                        {(() => {
                          const all = [
                            { val: item.metric_amount, u: item.metric_unit },
                            { val: item.amount, u: item.unit },
                            { val: item.imperial_amount, u: item.imperial_unit },
                          ].filter((m) => typeof m.val === 'number' && m.val > 0)

                          if (all.length === 0) {
                            return <span><bdi>—</bdi></span>
                          }

                          const primary = all[0];
                          const secondaries = all.slice(1);

                          return (
                            <>
                              <span>
                                <bdi>{formatAmount(primary.val * scale, primary.u || '')}</bdi>
                                {primary.u && <span className="ms-1 font-normal text-muted-foreground">{translateUnit(primary.u, rtl)}</span>}
                              </span>
                              {secondaries.map((sec, idx) => (
                                <span key={idx} className="mt-0.5 text-[0.85em] font-normal text-muted-foreground">
                                  <bdi>{formatAmount(sec.val * scale, sec.u || '')}</bdi>
                                  {sec.u && <span className="ms-1">{translateUnit(sec.u, rtl)}</span>}
                                </span>
                              ))}
                            </>
                          )
                        })()}
                      </span>
                      <span
                        className={cn(
                          'flex-1 transition-all',
                          done && 'text-muted-foreground line-through decoration-primary/40',
                        )}
                      >
                        {item.name}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
