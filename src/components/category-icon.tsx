import {
  CakeSlice,
  Cookie,
  CookingPot,
  Croissant,
  Folder,
  IceCreamCone,
  LayoutGrid,
  Soup,
  Wheat,
  type LucideIcon,
} from 'lucide-react'

const icons: Record<string, LucideIcon> = {
  'Breads & Doughs': Wheat,
  'Breakfast & Pastries': Croissant,
  'Cakes & Tarts': CakeSlice,
  Cookies: Cookie,
  'Savory Mains': CookingPot,
  'Soups & Sides': Soup,
  'Ice Cream': IceCreamCone,
}

export function CategoryIcon({ name, className }: { name: string | null; className?: string }) {
  const Icon = name === null ? LayoutGrid : (icons[name] ?? Folder)
  return <Icon className={className} aria-hidden="true" />
}
