export interface AtCoderColor {
  name: string
  color: string    // text / accent
  bgColor: string  // tailwind bg class
  borderColor: string
  min: number
  max: number
}

export const ATCODER_COLORS: AtCoderColor[] = [
  { name: 'Gray',   color: '#9A9A9A', bgColor: 'bg-gray-700',    borderColor: 'border-gray-500',   min: 0,    max: 400      },
  { name: 'Brown',  color: '#C06000', bgColor: 'bg-amber-950',   borderColor: 'border-amber-700',  min: 400,  max: 800      },
  { name: 'Green',  color: '#00C000', bgColor: 'bg-green-950',   borderColor: 'border-green-700',  min: 800,  max: 1200     },
  { name: 'Cyan',   color: '#00C0C0', bgColor: 'bg-teal-950',    borderColor: 'border-teal-600',   min: 1200, max: 1600     },
  { name: 'Blue',   color: '#4080FF', bgColor: 'bg-blue-950',    borderColor: 'border-blue-600',   min: 1600, max: 2000     },
  { name: 'Yellow', color: '#C0C000', bgColor: 'bg-yellow-950',  borderColor: 'border-yellow-600', min: 2000, max: 2400     },
  { name: 'Orange', color: '#FF8000', bgColor: 'bg-orange-950',  borderColor: 'border-orange-600', min: 2400, max: 2800     },
  { name: 'Red',    color: '#FF4040', bgColor: 'bg-red-950',     borderColor: 'border-red-700',    min: 2800, max: Infinity },
]

export const UNRATED_AC_COLOR: Omit<AtCoderColor, 'min' | 'max'> = {
  name: 'Unrated',
  color: '#6B7280',
  bgColor: 'bg-gray-800',
  borderColor: 'border-gray-600',
}

export function getAtCoderColor(clippedDifficulty: number): AtCoderColor {
  return (
    ATCODER_COLORS.find((c) => clippedDifficulty >= c.min && clippedDifficulty < c.max) ??
    ATCODER_COLORS[ATCODER_COLORS.length - 1]
  )
}
