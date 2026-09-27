import { FlaskConical, NotebookPen } from 'lucide-react'
import { formatNoteDate, type Labels } from '@/lib/recipe-utils'
import type { TrialNote } from '@/lib/recipes'

export function TrialNotes({
  notes,
  labels,
  rtl,
}: {
  notes: TrialNote[]
  labels: Labels
  rtl: boolean
}) {
  const sorted = [...notes].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <section
      aria-labelledby="notes-heading"
      className="rounded-2xl border border-border bg-secondary/60 p-5 sm:p-6"
    >
      <div className="mb-5 flex items-center gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-lg bg-card text-primary shadow-xs ring-1 ring-border">
          <FlaskConical className="size-4" aria-hidden="true" />
        </span>
        <h2 id="notes-heading" className="font-serif text-2xl font-semibold">
          {labels.notes}
        </h2>
      </div>

      {sorted.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
          <NotebookPen className="size-4 shrink-0" aria-hidden="true" />
          {labels.notesEmpty}
        </div>
      ) : (
        <ol className="relative flex flex-col gap-4 border-s-2 border-primary/20 ps-6">
          {sorted.map((note, i) => (
            <li key={`${note.date}-${i}`} className="relative">
              <span
                className="absolute top-4 -start-[31px] size-3 rounded-full border-2 border-card bg-primary shadow-sm"
                aria-hidden="true"
              />
              <article className="rounded-xl bg-card p-4 shadow-xs ring-1 ring-border/70">
                <time
                  dateTime={note.date}
                  className="text-xs font-semibold tracking-wide text-primary uppercase"
                >
                  {formatNoteDate(note.date, rtl)}
                </time>
                <p className="mt-1.5 leading-relaxed text-pretty">{note.note}</p>
              </article>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
