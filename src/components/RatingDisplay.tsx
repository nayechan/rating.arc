import { getTierFromRating } from '../utils/tierConverter'
import { RAINBOW_GRADIENT } from '../config/tierConfig'

interface RatingDisplayProps {
  rating: number
  label: string
  sublabel?: string
}

function rainbowTextStyle() {
  return {
    background: RAINBOW_GRADIENT,
    WebkitBackgroundClip: 'text' as const,
    WebkitTextFillColor: 'transparent' as const,
    backgroundClip: 'text' as const,
  }
}

export default function RatingDisplay({ rating, label, sublabel }: RatingDisplayProps) {
  const tier = getTierFromRating(rating)
  const isRainbow = tier.color === 'rainbow'

  return (
    <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-center gap-2">
      <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">{label}</span>
      <span
        className="text-5xl font-bold"
        style={isRainbow ? rainbowTextStyle() : { color: tier.color }}
      >
        {rating.toLocaleString()}
      </span>
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold border ${tier.bgColor} ${tier.borderColor}`}
        style={isRainbow ? rainbowTextStyle() : { color: tier.color }}
      >
        {tier.label}
      </span>
      {sublabel && <span className="text-gray-500 text-xs">{sublabel}</span>}
    </div>
  )
}
