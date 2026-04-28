export type TierName = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master' | 'grandmaster' | 'unrated'
export type SubTierLevel = 5 | 4 | 3 | 2 | 1

export interface SubTier {
  tier: Exclude<TierName, 'unrated'>
  level: SubTierLevel
  min: number   // inclusive
  max: number   // exclusive (Infinity for Ruby 1)
  label: string
  shortLabel: string
  color: string
  bgColor: string
  borderColor: string
}

const COLORS: Record<Exclude<TierName, 'unrated' | 'grandmaster'>, { color: string; bgColor: string; borderColor: string }> = {
  bronze:   { color: '#CD7F32', bgColor: 'bg-amber-900',  borderColor: 'border-amber-700'  },
  silver:   { color: '#C0C0C0', bgColor: 'bg-gray-600',   borderColor: 'border-gray-400'   },
  gold:     { color: '#FFD700', bgColor: 'bg-yellow-700', borderColor: 'border-yellow-500' },
  platinum: { color: '#00B8D4', bgColor: 'bg-cyan-800',   borderColor: 'border-cyan-500'   },
  diamond:  { color: '#1E90FF', bgColor: 'bg-blue-800',   borderColor: 'border-blue-500'   },
  master:   { color: '#9333EA', bgColor: 'bg-purple-950', borderColor: 'border-purple-500' },
}

type TierDef = [Exclude<TierName, 'unrated' | 'grandmaster'>, SubTierLevel, number, number]

// [tier, level, min (inclusive), max (exclusive)]
// B5 lower bound is -Infinity to catch negative IRT estimates
const TIER_DEFS: TierDef[] = [
  ['bronze',   5, -Infinity, 20 ],  // B5: catches negative IRT estimates (raw difficulty < 0)
  ['bronze',   4,  20,      100 ],
  ['bronze',   3,  100,      200 ],
  ['bronze',   2,  200,      300 ],
  ['bronze',   1,  300,      400 ],
  ['silver',   5,  400,      480 ],
  ['silver',   4,  480,      560 ],
  ['silver',   3,  560,      640 ],
  ['silver',   2,  640,      720 ],
  ['silver',   1,  720,      800 ],
  ['gold',     5,  800,      866 ],
  ['gold',     4,  866,      933 ],
  ['gold',     3,  933,      1000],
  ['gold',     2,  1000,     1100],
  ['gold',     1,  1100,     1200],
  ['platinum', 5,  1200,     1400],
  ['platinum', 4,  1400,     1600],
  ['platinum', 3,  1600,     1733],
  ['platinum', 2,  1733,     1866],
  ['platinum', 1,  1866,     2000],
  ['diamond',  5,  2000,     2200],
  ['diamond',  4,  2200,     2400],
  ['diamond',  3,  2400,     2533],
  ['diamond',  2,  2533,     2666],
  ['diamond',  1,  2666,     2800],
  ['master',   5,  2800,     3000],
  ['master',   4,  3000,     3200],
  ['master',   3,  3200,     3400],
  ['master',   2,  3400,     3600],
  ['master',   1,  3600,     Infinity],
]

export const ALL_SUB_TIERS: SubTier[] = TIER_DEFS.map(([tier, level, min, max]) => {
  const label = `${tier.charAt(0).toUpperCase() + tier.slice(1)} ${level}`
  return {
    tier, level, min, max,
    label,
    shortLabel: `${tier[0].toUpperCase()}${level}`,
    ...COLORS[tier],
  }
})

export const UNRATED_CONFIG = {
  tier: 'unrated' as TierName,
  label: 'Unrated',
  shortLabel: '?',
  color: '#6B7280',
  bgColor: 'bg-gray-700',
  borderColor: 'border-gray-500',
}

export const GRAND_MASTER_CONFIG = {
  tier: 'grandmaster' as TierName,
  label: 'Grand Master',
  shortLabel: 'GM',
  color: 'rainbow',
  bgColor: 'bg-gray-900',
  borderColor: 'border-purple-400',
}

/** CSS gradient string for rainbow (Grand Master) text/borders. */
export const RAINBOW_GRADIENT =
  'linear-gradient(90deg, #ff9eb5 0%, #ffb347 18%, #fff176 33%, #a8e6a3 50%, #80d4f5 65%, #c9a0f5 80%, #f9a8d4 100%)'
