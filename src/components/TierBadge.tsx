import { getSubTierFromDifficulty } from '../utils/tierConverter'

interface TierBadgeProps {
  difficulty: number | null
  showLabel?: boolean
  majorTierOnly?: boolean
}

export default function TierBadge({ difficulty, showLabel = true, majorTierOnly = false }: TierBadgeProps) {
  const tier = getSubTierFromDifficulty(difficulty)

  const label = (() => {
    if (!('level' in tier)) return tier.label
    if (majorTierOnly) return tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1)
    return tier.label
  })()

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${tier.bgColor} ${tier.borderColor}`}
      style={{ color: tier.color }}
    >
      {showLabel && label}
    </span>
  )
}
