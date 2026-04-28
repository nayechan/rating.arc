import { useState, useEffect } from 'react'

const API_BASE = 'https://kenkoooo.com/atcoder/atcoder-api/v3'

interface AtCoderRatingResult {
  rating: number | null
  loading: boolean
  error: string | null
}

export function useAtCoderRating(userId: string): AtCoderRatingResult {
  const [rating, setRating] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    setError(null)

    fetch(`${API_BASE}/user/ac_rank?user=${encodeURIComponent(userId)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        return res.json()
      })
      .then((data) => {
        setRating(data?.rating ?? null)
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Unknown error')
      })
      .finally(() => setLoading(false))
  }, [userId])

  return { rating, loading, error }
}
