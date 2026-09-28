export interface IngredientItem {
  name: string
  metric_amount?: number
  metric_unit?: string
  imperial_amount?: number
  imperial_unit?: string
  amount?: number
  unit?: string
}

export interface IngredientGroup {
  section?: string
  items: IngredientItem[]
}

export interface InstructionStep {
  title?: string
  text: string
  wait_time_minutes?: number
  image?: string
}

export interface InstructionGroup {
  section?: string
  steps: InstructionStep[]
}

export interface TrialNote {
  date: string
  note: string
}

export interface Recipe {
  id?: string
  title: string
  hebrew_title?: string
  description?: string
  category: string
  tags: string[]
  images: string[]
  original_url?: string
  youtube_url?: string
  before_starting?: string[]
  tips?: string[]
  ingredients: IngredientGroup[]
  instructions: InstructionGroup[]
  trial_notes: TrialNote[]
}
