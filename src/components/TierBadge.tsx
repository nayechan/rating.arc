import { getSubTierFromDifficulty, getProblemDeprecationLevel } from '../utils/tierConverter'

interface TierBadgeProps {
  difficulty: number | null
  showLabel?: boolean
  majorTierOnly?: boolean
  bright?: boolean
  startEpochSecond?: number | null
}

export default function TierBadge({ difficulty, showLabel = true, majorTierOnly = false, bright = false, startEpochSecond }: TierBadgeProps) {
  const tier = getSubTierFromDifficulty(difficulty)
  const deprecation = getProblemDeprecationLevel(startEpochSecond ?? null)

  const label = (() => {
    if (!('level' in tier)) return tier.label
    if (majorTierOnly) return tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1)
    return tier.label
  })()

  const opacity = deprecation === 'deprecated' ? 0.4 : deprecation === 'fade' ? 0.65 : 1
  const filterParts: string[] = []
  if (bright) filterParts.push('brightness(1.6)')
  if (deprecation === 'deprecated') filterParts.push('grayscale(0.6)')

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border whitespace-nowrap ${tier.bgColor} ${tier.borderColor}`}
      style={{ color: tier.color, opacity, filter: filterParts.length ? filterParts.join(' ') : undefined }}
    >
      {showLabel && label}
    </span>
  )
}
