import { getDifficultyTierNumber, getProblemDeprecationLevel } from './tierConverter'

export interface RatedProblemEntry {
  difficulty: number
  startEpochSecond: number | null
}

export function calcSolvedAcRating(entries: RatedProblemEntry[]): number {
  if (entries.length === 0) return 0

  const weighted = entries.filter((e) => getProblemDeprecationLevel(e.startEpochSecond) !== 'deprecated')
  const tierNums = weighted.map((e) => getDifficultyTierNumber(e.difficulty)).sort((a, b) => b - a).slice(0, 100)
  const tierSum = tierNums.reduce((acc, t) => acc + t, 0)
  const countBonus = 200 * (1 - Math.pow(0.995, weighted.length))

  return Math.round(tierSum + countBonus)
}
