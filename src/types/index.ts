export interface RawProblem {
  id: string
  contest_id: string
  problem_index: string
  name: string
  title: string
}

export interface ProblemModel {
  slope: number | null
  intercept: number | null
  variance: number | null
  difficulty: number | null
  discrimination: number | null
  irt_loglikelihood: number | null
  irt_users: number | null
  is_experimental: boolean
}

export interface ContestProblem {
  contest_id: string
  problem_id: string
}

export interface MergedProblem {
  id: string
  contest_id: string
  problem_index: string
  name: string
  title: string
  difficulty: number | null
  solver_count: number | null
  submission_count: number | null
}

export interface Contest {
  id: string
  start_epoch_second: number
  duration_second: number
  title: string
  rate_change: string
}

export interface Submission {
  id: number
  epoch_second: number
  problem_id: string
  contest_id: string
  user_id: string
  language: string
  point: number
  length: number
  result: string
  execution_time: number | null
}

export type SolveStatus = 'AC' | 'Tried' | '-'

export interface ContestType {
  id: 'ABC' | 'ARC' | 'AGC' | 'AHC' | 'Other'
  label: string
}

export const CONTEST_TYPES: ContestType[] = [
  { id: 'ABC', label: 'ABC' },
  { id: 'ARC', label: 'ARC' },
  { id: 'AGC', label: 'AGC' },
  { id: 'AHC', label: 'AHC' },
  { id: 'Other', label: 'Other' },
]

export function getContestType(contestId: string): ContestType['id'] {
  const upper = contestId.toUpperCase()
  if (upper.startsWith('ABC')) return 'ABC'
  if (upper.startsWith('ARC')) return 'ARC'
  if (upper.startsWith('AGC')) return 'AGC'
  if (upper.startsWith('AHC')) return 'AHC'
  return 'Other'
}
