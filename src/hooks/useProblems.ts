import { useState, useEffect } from 'react'
import type { MergedProblem, RawProblem, ProblemModel, Contest } from '../types'

const BASE_URL = import.meta.env.BASE_URL

interface UseProblemsResult {
  problems: MergedProblem[]
  loading: boolean
  error: string | null
}

export function useProblems(): UseProblemsResult {
  const [problems, setProblems] = useState<MergedProblem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [problemsRes, modelsRes, contestsRes] = await Promise.all([
          fetch(`${BASE_URL}data/merged-problems.json`),
          fetch(`${BASE_URL}data/problem-models.json`),
          fetch(`${BASE_URL}data/contests.json`),
        ])

        if (!problemsRes.ok || !modelsRes.ok || !contestsRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const rawProblems: RawProblem[] = await problemsRes.json()
        const models: Record<string, ProblemModel> = await modelsRes.json()
        const contests: Contest[] = await contestsRes.json()

        const contestStartMap = new Map<string, number>()
        for (const c of contests) {
          contestStartMap.set(c.id, c.start_epoch_second)
        }

        const merged: MergedProblem[] = rawProblems.map((p) => ({
          id: p.id,
          contest_id: p.contest_id,
          problem_index: p.problem_index,
          name: p.name,
          title: p.title,
          difficulty: models[p.id]?.difficulty ?? null,
          solver_count: p.solver_count ?? null,
          submission_count: null,
          contest_start_epoch_second: contestStartMap.get(p.contest_id) ?? null,
        }))

        setProblems(merged)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { problems, loading, error }
}
