'use client'

import { useState } from 'react'
import { Scale } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Labels } from '@/lib/recipe-utils'

const PRESETS = [0.5, 1, 2]

export function BatchScaler({
  scale,
  onScaleChange,
  labels,
}: {
  scale: number
  onScaleChange: (value: number) => void
  labels: Labels
}) {
  const [custom, setCustom] = useState('')
  const isCustom = !PRESETS.includes(scale)

  function handleCustom(value: string) {
    setCustom(value)
    const parsed = Number.parseFloat(value.replace(',', '.'))
    if (Number.isFinite(parsed) && parsed > 0 && parsed <= 50) onScaleChange(parsed)
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs sm:p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          <Scale className="size-4" aria-hidden="true" />
        </span>
        {labels.batch}
      </div>
      <div
        className="flex items-center gap-1 rounded-xl bg-muted p-1"
        role="radiogroup"
        aria-label={labels.batch}
        dir="ltr"
      >
        {PRESETS.map((value) => (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={scale === value}
            onClick={() => {
              setCustom('')
              onScaleChange(value)
            }}
            className={cn(
              'min-w-12 rounded-lg px-3 py-1.5 text-sm font-semibold tabular-nums transition-all',
              scale === value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {value}×
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{labels.custom}</span>
        <span className="relative" dir="ltr">
          <input
            type="number"
            inputMode="decimal"
            min={0.1}
            max={50}
            step={0.25}
            value={custom}
            onChange={(e) => handleCustom(e.target.value)}
            placeholder="1.5"
            className={cn(
              'h-9 w-20 rounded-lg border bg-background pr-6 pl-2.5 text-sm font-semibold text-foreground tabular-nums outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/40',
              isCustom ? 'border-primary' : 'border-input',
            )}
          />
          <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs text-muted-foreground">
            ×
          </span>
        </span>
      </label>
    </div>
  )
}
