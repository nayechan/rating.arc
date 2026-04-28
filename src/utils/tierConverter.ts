import { ALL_SUB_TIERS, UNRATED_CONFIG, GRAND_MASTER_CONFIG, type SubTier } from '../config/tierConfig'

// 2020-01-01 00:00:00 UTC
const EPOCH_2020 = 1577836800
// 2022-01-01 00:00:00 UTC
const EPOCH_2022 = 1640995200

export type DeprecationLevel = 'normal' | 'fade' | 'deprecated'

/**
 * Returns the deprecation level of a problem based on its contest date.
 * deprecated (≤2019): excluded from rating weighting, shown dimmed
 * fade (2020–2021): included in rating, shown slightly dimmed
 * normal (≥2022): no treatment
 */
export function getProblemDeprecationLevel(startEpochSecond: number | null): DeprecationLevel {
  if (startEpochSecond === null) return 'normal'
  if (startEpochSecond < EPOCH_2020) return 'deprecated'
  if (startEpochSecond < EPOCH_2022) return 'fade'
  return 'normal'
}

export type TierInfo = SubTier | typeof UNRATED_CONFIG | typeof GRAND_MASTER_CONFIG

/**
 * Normalizes raw IRT difficulty for display purposes.
 * Maps negative values to small positive numbers so the UI never shows negatives.
 *   d >= 400 → d (unchanged)
 *   d <  400 → 400 / exp(1 - d/400)
 *
 * Example: raw -1030 → displayed ~11
 */
export function clipDifficulty(difficulty: number): number {
  if (difficulty >= 400) return Math.round(difficulty)
  return Math.round(400 / Math.exp(1.0 - difficulty / 400))
}

/**
 * Tier classification uses raw IRT difficulty so that negative values
 * correctly fall into Bronze 5 (min: -Infinity, max: 0).
 */
export function getSubTierFromDifficulty(difficulty: number | null): TierInfo {
  if (difficulty === null) return UNRATED_CONFIG

  for (const st of ALL_SUB_TIERS) {
    if (difficulty >= st.min && difficulty < st.max) return st
  }
  return ALL_SUB_TIERS[ALL_SUB_TIERS.length - 1]
}

/**
 * Returns the tier number (1-30) for a raw IRT difficulty.
 * B5=1, B4=2, B3=3, B2=4, B1=5, S5=6, ..., R1=30.
 * Used for the solved.ac style rating calculation.
 */
export function getDifficultyTierNumber(difficulty: number): number {
  for (let i = 0; i < ALL_SUB_TIERS.length; i++) {
    const st = ALL_SUB_TIERS[i]
    if (difficulty >= st.min && difficulty < st.max) return i + 1
  }
  return ALL_SUB_TIERS.length
}

// Minimum rating required to reach each tier (index i → ALL_SUB_TIERS[i])
// Unrated: < 30, B5: 30, B4: 60, ..., M1: 2900, Grand Master: 3000
const RATING_THRESHOLDS = [
   30,  60,  90, 120, 150,   // Bronze 5-1
  200, 300, 400, 500, 600,   // Silver 5-1
  750, 900,1050,1200,1350,   // Gold 5-1
 1500,1600,1700,1800,1900,   // Platinum 5-1
 2000,2100,2200,2300,2400,   // Diamond 5-1
 2500,2600,2700,2800,2900,   // Master 5-1
]

const GRAND_MASTER_THRESHOLD = 3000

/**
 * Maps a computed solved.ac-style rating to its display tier.
 * Uses the rating thresholds (not IRT difficulty ranges).
 */
export function getTierFromRating(rating: number): TierInfo {
  if (rating >= GRAND_MASTER_THRESHOLD) return GRAND_MASTER_CONFIG
  let idx = -1
  for (let i = 0; i < RATING_THRESHOLDS.length; i++) {
    if (rating >= RATING_THRESHOLDS[i]) idx = i
    else break
  }
  return idx === -1 ? UNRATED_CONFIG : ALL_SUB_TIERS[idx]
}

/** Progress info for rendering a progress bar within the current tier. */
export function getRatingProgressInfo(rating: number): {
  currentMin: number
  nextMin: number | null
  progress: number
} {
  if (rating >= GRAND_MASTER_THRESHOLD) {
    return { currentMin: GRAND_MASTER_THRESHOLD, nextMin: null, progress: 100 }
  }
  let idx = -1
  for (let i = 0; i < RATING_THRESHOLDS.length; i++) {
    if (rating >= RATING_THRESHOLDS[i]) idx = i
    else break
  }
  const currentMin = idx === -1 ? 0 : RATING_THRESHOLDS[idx]
  const nextMin = idx + 1 < RATING_THRESHOLDS.length ? RATING_THRESHOLDS[idx + 1] : GRAND_MASTER_THRESHOLD
  const progress = Math.min(100, ((rating - currentMin) / (nextMin - currentMin)) * 100)
  return { currentMin, nextMin, progress }
}

/** Returns the SubTier for a given tier number (1–30). */
export function getSubTierByNumber(tierNum: number): SubTier {
  return ALL_SUB_TIERS[Math.max(0, Math.min(tierNum - 1, ALL_SUB_TIERS.length - 1))]
}
