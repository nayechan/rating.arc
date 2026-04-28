import { getDifficultyTierNumber } from './tierConverter'

export function calcSolvedAcRating(difficulties: number[]): number {
  if (difficulties.length === 0) return 0

  const tierNums = difficulties.map(getDifficultyTierNumber).sort((a, b) => b - a).slice(0, 100)
  const tierSum = tierNums.reduce((acc, t) => acc + t, 0)
  const countBonus = 200 * (1 - Math.pow(0.995, difficulties.length))

  return Math.round(tierSum + countBonus)
}
