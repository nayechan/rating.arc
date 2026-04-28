import { useState, useEffect } from 'react'
import type { Contest } from '../types'

const BASE_URL = import.meta.env.BASE_URL

export interface ContestInfo {
  start: number
  end: number
}

interface UseContestsResult {
  contestMap: Map<string, ContestInfo>
  loading: boolean
}

let cache: Map<string, ContestInfo> | null = null

export function useContests(): UseContestsResult {
  const [contestMap, setContestMap] = useState<Map<string, ContestInfo>>(cache ?? new Map())
  const [loading, setLoading] = useState(cache === null)

  useEffect(() => {
    if (cache !== null) return

    fetch(`${BASE_URL}data/contests.json`)
      .then((r) => r.json())
      .then((contests: Contest[]) => {
        const map = new Map<string, ContestInfo>()
        for (const c of contests) {
          map.set(c.id, {
            start: c.start_epoch_second,
            end: c.start_epoch_second + c.duration_second,
          })
        }
        cache = map
        setContestMap(map)
      })
      .finally(() => setLoading(false))
  }, [])

  return { contestMap, loading }
}
