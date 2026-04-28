import { getSubTierFromDifficulty, getProblemDeprecationLevel } from '../utils/tierConverter'

interface TierBadgeProps {
  difficulty: number | null
  showLabel?: boolean
  majorTierOnly?: boolean
  bright?: boolean
  startEpochSecond?: number | null
  suppressFade?: boolean
}

const DEPRECATION_TOOLTIP: Record<string, string> = {
  deprecated: 'Excluded from rating (problem from 2019 or earlier)',
  fade: 'Old problem (from 2020–2021)',
}

export default function TierBadge({ difficulty, showLabel = true, majorTierOnly = false, bright = false, startEpochSecond, suppressFade = false }: TierBadgeProps) {
  const tier = getSubTierFromDifficulty(difficulty)
  const deprecation = getProblemDeprecationLevel(startEpochSecond ?? null)

  const label = (() => {
    if (!('level' in tier)) return tier.label
    if (majorTierOnly) return tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1)
    return tier.label
  })()

  const effectiveDeprecation = suppressFade && deprecation === 'fade' ? 'normal' : deprecation
  const opacity = effectiveDeprecation === 'deprecated' ? 0.3 : effectiveDeprecation === 'fade' ? 0.5 : 1
  const filterParts: string[] = []
  if (bright) filterParts.push('brightness(1.6)')
  if (effectiveDeprecation === 'deprecated') filterParts.push('grayscale(0.9)')

  const tooltip = deprecation === 'fade' && suppressFade ? undefined : DEPRECATION_TOOLTIP[deprecation]

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border whitespace-nowrap ${tier.bgColor} ${tier.borderColor}`}
      style={{ color: tier.color, opacity, filter: filterParts.length ? filterParts.join(' ') : undefined }}
      title={tooltip}
    >
      {showLabel && label}
    </span>
  )
}
