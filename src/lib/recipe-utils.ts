import type { Recipe } from './recipes'

const HEBREW = /[\u0590-\u05FF]/

export function hasHebrew(text?: string) {
  return !!text && HEBREW.test(text)
}

export function isRecipeHebrew(recipe: Recipe) {
  return (
    hasHebrew(recipe.title) ||
    hasHebrew(recipe.description) ||
    hasHebrew(recipe.instructions[0]?.steps[0]?.text)
  )
}

const UNIT_TRANSLATIONS: Record<string, string> = {
  'grams': 'גרם',
  'g': 'גרם',
  'ml': 'מ"ל',
  'cups': 'כוסות',
  'cup': 'כוס',
  'teaspoons': 'כפיות',
  'teaspoon': 'כפית',
  'tablespoons': 'כפות',
  'tablespoon': 'כף',
  'pounds': 'פאונד',
  'pound': 'פאונד',
  'ounces': 'אונקיות',
  'ounce': 'אונקיה',
  'pinch': 'קורט',
  'pinches': 'קורט',
  'cloves': 'שיני',
  'clove': 'שן',
  'large': 'גדול/ה',
  'medium': 'בינוני/ת',
  'small': 'קטן/ה',
}

export function translateUnit(unit: string, rtl: boolean): string {
  if (!rtl || !unit) return unit;
  const lowerUnit = unit.toLowerCase().trim();
  return UNIT_TRANSLATIONS[lowerUnit] || unit;
}

const FRACTIONS: [number, string][] = [
  [1 / 8, '⅛'],
  [1 / 4, '¼'],
  [1 / 3, '⅓'],
  [1 / 2, '½'],
  [2 / 3, '⅔'],
  [3 / 4, '¾'],
]

const METRIC_UNITS = /^(g|gr|kg|mg|ml|l|cl|dl|גרם|גר'?|ק"ג|מ"ג|מ"ל|ליטר|ל')$/i

function trimNumber(value: number, maxDecimals: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: maxDecimals,
    useGrouping: false,
  }).format(value)
}

export function formatAmount(value: number, unit: string) {
  if (!Number.isFinite(value) || value <= 0) return '—'

  if (METRIC_UNITS.test(unit.trim())) {
    if (value >= 100) return trimNumber(Math.round(value), 0)
    if (value >= 10) return trimNumber(value, 1)
    return trimNumber(value, 2)
  }

  const whole = Math.floor(value)
  const remainder = value - whole
  if (remainder < 0.03) return String(whole)
  if (remainder > 0.97) return String(whole + 1)

  const match = FRACTIONS.find(([frac]) => Math.abs(remainder - frac) < 0.03)
  if (match) return whole > 0 ? `${whole}${match[1]}` : match[1]
  return trimNumber(value, 2)
}

export type FolderNode = {
  name: string
  path: string
  children: FolderNode[]
  recipes: Recipe[]
}

export function buildFolderTree(list: Recipe[]): FolderNode[] {
  const root: FolderNode = { name: '', path: '', children: [], recipes: [] }

  for (const recipe of list) {
    const parts = recipe.category
      .split('>')
      .map((p) => p.trim())
      .filter(Boolean)
    let node = root
    for (const part of parts) {
      const path = node.path ? `${node.path}/${part}` : part
      let child = node.children.find((c) => c.name === part)
      if (!child) {
        child = { name: part, path, children: [], recipes: [] }
        node.children.push(child)
      }
      node = child
    }
    node.recipes.push(recipe)
  }

  return root.children
}

export function countRecipes(node: FolderNode): number {
  return node.recipes.length + node.children.reduce((sum, c) => sum + countRecipes(c), 0)
}

export function filterRecipes(list: Recipe[], query: string, activeTags: string[]) {
  const q = query.trim().toLowerCase()
  return list.filter((recipe) => {
    if (activeTags.length && !activeTags.every((t) => recipe.tags.includes(t))) return false
    if (!q) return true
    const haystack = [
      recipe.title,
      recipe.hebrew_title,
      recipe.category,
      ...recipe.tags,
      ...recipe.ingredients.flatMap((g) => g.items.map((i) => i.name)),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function recipeToHtml(recipe: Recipe, scale: number) {
  const rtl = isRecipeHebrew(recipe)
  const dir = rtl ? 'rtl' : 'ltr'
  const t = rtl
    ? { ingredients: 'מצרכים', method: 'אופן ההכנה', notes: 'יומן ניסויים', batch: 'כמות' }
    : { ingredients: 'Ingredients', method: 'Method', notes: 'Trial notes', batch: 'Batch' }

  const ingredients = recipe.ingredients
    .map(
      (g) => `
      ${g.section ? `<h3>${escapeHtml(g.section)}</h3>` : ''}
      <ul>${g.items
        .map(
          (i) => {
            const measurements = [
              { val: i.amount, u: i.unit },
              { val: i.amount2, u: i.unit2 },
              { val: i.metric_amount, u: i.metric_unit },
              { val: i.imperial_amount, u: i.imperial_unit },
            ].filter((m) => typeof m.val === 'number' && m.val > 0)

            if (measurements.length === 0) return `<li><strong><bdi>—</bdi></strong> ${escapeHtml(i.name)}</li>`

            const measuresHtml = measurements.map(m => `<bdi>${formatAmount(m.val * scale, m.u || '')}</bdi> ${escapeHtml(translateUnit(m.u || '', rtl))}`).join(' / ')
            return `<li><strong>${measuresHtml}</strong> ${escapeHtml(i.name)}</li>`
          }
        )
        .join('')}</ul>`,
    )
    .join('')

  const steps = recipe.instructions
    .map(
      (g) => `
      ${g.section ? `<h3>${escapeHtml(g.section)}</h3>` : ''}
      <ol>${g.steps.map((s) => `<li>${s.title ? `<strong>${escapeHtml(s.title)}</strong><br/>` : ''}${escapeHtml(s.text)}${s.wait_time_minutes ? ` <br/><em>⏱ Wait time: ${s.wait_time_minutes < 60 ? `${s.wait_time_minutes} minutes` : `${Math.floor(s.wait_time_minutes / 60)} hour${Math.floor(s.wait_time_minutes / 60) > 1 ? 's' : ''}${s.wait_time_minutes % 60 > 0 ? ` ${s.wait_time_minutes % 60} min` : ''}`}</em>` : ''}</li>`).join('')}</ol>`,
    )
    .join('')

  const beforeStarting = recipe.before_starting && recipe.before_starting.length > 0
    ? `<div style="background:rgba(224, 114, 53, 0.05); border:1px solid rgba(224, 114, 53, 0.2); padding:16px; border-radius:8px; margin-bottom: 24px;">
         <h3 style="margin-top:0; color:#a4502a;">Before Starting</h3>
         <ul style="margin:0; padding-left:20px;">
           ${recipe.before_starting.map((note) => `<li>${escapeHtml(note)}</li>`).join('')}
         </ul>
       </div>`
    : ''

  const notes = recipe.trial_notes.length
    ? `<h2>${t.notes}</h2><ul>${recipe.trial_notes
        .map((n) => `<li><time>${escapeHtml(n.date)}</time> — ${escapeHtml(n.note)}</li>`)
        .join('')}</ul>`
    : ''

  return `<!doctype html>
<html lang="${rtl ? 'he' : 'en'}" dir="${dir}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(recipe.title)}</title>
<style>
  body { font-family: "Heebo", system-ui, sans-serif; background:#faf8f5; color:#2b2622; max-width:720px; margin:0 auto; padding:40px 24px; line-height:1.6; }
  h1 { font-family: Georgia, "Frank Ruhl Libre", serif; font-size:2.2rem; line-height:1.15; margin:0 0 4px; }
  h2 { font-family: Georgia, "Frank Ruhl Libre", serif; border-bottom:1px solid #e7e1d9; padding-bottom:6px; margin-top:36px; }
  h3 { color:#a4502a; font-size:.8rem; text-transform:uppercase; letter-spacing:.08em; margin:20px 0 6px; }
  .sub { color:#7a6f65; font-size:1.1rem; margin:0 0 12px; }
  .meta { color:#7a6f65; font-size:.9rem; }
  img { width:100%; border-radius:16px; margin:20px 0; }
  li { margin:6px 0; }
  strong { color:#a4502a; }
</style>
</head>
<body>
  <h1>${escapeHtml(recipe.title)}</h1>
  ${recipe.hebrew_title ? `<p class="sub" dir="auto">${escapeHtml(recipe.hebrew_title)}</p>` : ''}
  ${recipe.description ? `<p>${escapeHtml(recipe.description)}</p>` : ''}
  ${beforeStarting}
  <p class="meta">${escapeHtml(recipe.category)} · ${t.batch}: <bdi>${scale}×</bdi></p>
  ${recipe.images[0] && /^https?:/.test(recipe.images[0]) ? `<img src="${escapeHtml(recipe.images[0])}" alt="" />` : ''}
  <h2>${t.ingredients}</h2>${ingredients}
  <h2>${t.method}</h2>${steps}
  ${notes}
</body>
</html>`
}

export function formatNoteDate(date: string, rtl: boolean) {
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return new Intl.DateTimeFormat(rtl ? 'he-IL' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

export function getLabels(rtl: boolean) {
  return rtl
    ? {
        ingredients: 'מצרכים',
        instructions: 'אופן ההכנה',
        notes: 'יומן ניסויים ובדיקות',
        notesEmpty: 'עדיין אין רשומות ניסוי למתכון הזה.',
        batch: 'הגדלת כמות',
        custom: 'מותאם',
        steps: 'שלבים',
        items: 'פריטים',
        reset: 'איפוס',
        source: 'מקור המתכון',
        video: 'סרטון',
        step: 'שלב',
        tips: 'טיפים',
      }
    : {
        ingredients: 'Ingredients',
        instructions: 'Instructions',
        notes: 'Trial & Test Notes',
        notesEmpty: 'No trial notes logged for this recipe yet.',
        batch: 'Batch size',
        custom: 'Custom',
        steps: 'steps',
        items: 'items',
        reset: 'Reset',
        source: 'Original recipe',
        video: 'Watch video',
        step: 'Step',
        tips: 'Tips',
      }
}

export type Labels = ReturnType<typeof getLabels>

export function categoryTrail(recipe: Recipe): string[] {
  return recipe.category ? recipe.category.split('>').map((p) => p.trim()).filter(Boolean) : []
}

export function formatTag(tag: string): string {
  return tag
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
