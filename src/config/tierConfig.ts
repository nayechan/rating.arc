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
  ['bronze',   5, -Infinity, 0   ],  // B5: catches negative IRT estimates (raw difficulty < 0)
  ['bronze',   4,  0,        50  ],
  ['bronze',   3,  50,       100 ],
  ['bronze',   2,  100,      150 ],
  ['bronze',   1,  150,      200 ],
  ['silver',   5,  200,      250 ],
  ['silver',   4,  250,      300 ],
  ['silver',   3,  300,      350 ],
  ['silver',   2,  350,      400 ],
  ['silver',   1,  400,      500 ],
  ['gold',     5,  500,      600 ],
  ['gold',     4,  600,      700 ],
  ['gold',     3,  700,      800 ],
  ['gold',     2,  800,      900 ],
  ['gold',     1,  900,      1050],
  ['platinum', 5,  1050,     1200],
  ['platinum', 4,  1200,     1400],
  ['platinum', 3,  1400,     1600],
  ['platinum', 2,  1600,     1750],
  ['platinum', 1,  1750,     1900],
  ['diamond',  5,  1900,     2000],
  ['diamond',  4,  2000,     2200],
  ['diamond',  3,  2200,     2400],
  ['diamond',  2,  2400,     2550],
  ['diamond',  1,  2550,     2700],
  ['master',     5,  2700,     2900],
  ['master',     4,  2900,     3100],
  ['master',     3,  3100,     3300],
  ['master',     2,  3300,     3500],
  ['master',     1,  3500,     Infinity],
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
