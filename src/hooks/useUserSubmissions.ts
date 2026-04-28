import { useState, useCallback } from 'react'
import type { Submission } from '../types'

const API_BASE = 'https://kenkoooo.com/atcoder/atcoder-api/v3'

interface UserSubmissionsResult {
  acSet: Set<string>
  acTimeMap: Map<string, number>      // problemId → latest AC epoch_second
  acFirstTimeMap: Map<string, number> // problemId → earliest AC epoch_second
  triedSet: Set<string>
  loading: boolean
  error: string | null
  fetchSubmissions: (userId: string) => Promise<void>
}

export function useUserSubmissions(): UserSubmissionsResult {
  const [acSet, setAcSet] = useState<Set<string>>(new Set())
  const [acTimeMap, setAcTimeMap] = useState<Map<string, number>>(new Map())
  const [acFirstTimeMap, setAcFirstTimeMap] = useState<Map<string, number>>(new Map())
  const [triedSet, setTriedSet] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSubmissions = useCallback(async (userId: string) => {
    if (!userId.trim()) return
    setLoading(true)
    setError(null)

    try {
      const allSubmissions: Submission[] = []
      let fromSecond = 0

      while (true) {
        const res = await fetch(
          `${API_BASE}/user/submissions?user=${encodeURIComponent(userId)}&from_second=${fromSecond}`
        )
        if (!res.ok) throw new Error(`API error: ${res.status}`)

        const batch: Submission[] = await res.json()
        allSubmissions.push(...batch)

        if (batch.length < 500) break
        fromSecond = batch[batch.length - 1].epoch_second + 1
      }

      const newAcSet = new Set<string>()
      const newAcTimeMap = new Map<string, number>()
      const newAcFirstTimeMap = new Map<string, number>()
      const newTriedSet = new Set<string>()

      for (const s of allSubmissions) {
        if (s.result === 'AC') {
          newAcSet.add(s.problem_id)
          const prevLatest = newAcTimeMap.get(s.problem_id) ?? 0
          if (s.epoch_second > prevLatest) newAcTimeMap.set(s.problem_id, s.epoch_second)
          const prevFirst = newAcFirstTimeMap.get(s.problem_id) ?? Infinity
          if (s.epoch_second < prevFirst) newAcFirstTimeMap.set(s.problem_id, s.epoch_second)
        } else {
          newTriedSet.add(s.problem_id)
        }
      }

      setAcSet(newAcSet)
      setAcTimeMap(newAcTimeMap)
      setAcFirstTimeMap(newAcFirstTimeMap)
      setTriedSet(newTriedSet)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  return { acSet, acTimeMap, acFirstTimeMap, triedSet, loading, error, fetchSubmissions }
}
