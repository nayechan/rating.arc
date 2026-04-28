import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProblems } from '../hooks/useProblems'
import { useUserSubmissions } from '../hooks/useUserSubmissions'
import { useContests } from '../hooks/useContests'
import {
  getSubTierFromDifficulty,
  getTierFromRating,
  getRatingProgressInfo,
  getDifficultyTierNumber,
  getSubTierByNumber,
  clipDifficulty,
  getProblemDeprecationLevel,
} from '../utils/tierConverter'
import { RAINBOW_GRADIENT } from '../config/tierConfig'
import { getAtCoderColor } from '../utils/atcoderColors'
import RatingDisplay from '../components/RatingDisplay'
import TierBadge from '../components/TierBadge'
import type { TierName } from '../config/tierConfig'

const API_BASE = 'https://kenkoooo.com/atcoder/atcoder-api/v3'

type ContestEntry = { start: number; end: number }

function Top100Grid({
  problems,
  acFirstTimeMap,
  contestMap,
}: {
  problems: { id: string; contest_id: string; difficulty: number; title?: string; name: string }[]
  acFirstTimeMap: Map<string, number>
  contestMap: Map<string, ContestEntry>
}) {
  const [tooltip, setTooltip] = useState<{ tierLabel: string; tierColor: string; title: string; x: number; y: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className="relative flex flex-wrap gap-x-3 gap-y-1">
      {Array.from({ length: Math.ceil(problems.length / 10) }, (_, chunk) => (
        <div key={chunk} className="flex gap-1">
          {problems.slice(chunk * 10, chunk * 10 + 10).map((p, i) => {
            const t = getDifficultyTierNumber(p.difficulty)
            const st = getSubTierByNumber(t)
            const firstAc = acFirstTimeMap.get(p.id)
            const contest = contestMap.get(p.contest_id)
            const inContest = firstAc !== undefined && contest !== undefined && firstAc >= contest.start && firstAc <= contest.end
            const href = `https://atcoder.jp/contests/${p.contest_id}/tasks/${p.id}`
            return (
              <a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center w-7 h-7 rounded text-xs font-bold border ${st.bgColor} ${st.borderColor} ${inContest ? 'animate-sparkle' : ''}`}
                style={{ color: st.color }}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const containerRect = containerRef.current!.getBoundingClientRect()
                  setTooltip({
                    tierLabel: st.label,
                    tierColor: st.color,
                    title: p.title ?? p.name,
                    x: rect.left - containerRect.left + rect.width / 2,
                    y: rect.top - containerRect.top,
                  })
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                {st.level}
              </a>
            )
          })}
        </div>
      ))}
      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-50%, calc(-100% - 6px))' }}
        >
          <div className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg flex items-center gap-1.5">
            <span className="font-bold" style={{ color: tooltip.tierColor }}>{tooltip.tierLabel}</span>
            <span className="text-gray-400">|</span>
            <span className="text-white">{tooltip.title}</span>
          </div>
        </div>
      )}
    </div>
  )
}

const MAJOR_TIERS: Exclude<TierName, 'unrated' | 'grandmaster'>[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master']

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>()
  const { problems, loading: problemsLoading } = useProblems()
  const { acSet, acTimeMap, acFirstTimeMap, loading: subLoading, fetchSubmissions } = useUserSubmissions()
  const { contestMap, loading: contestsLoading } = useContests()
  const [atcoderRating, setAtcoderRating] = useState<number | null>(null)
  const [ratingLoading, setRatingLoading] = useState(false)
  const [acFilter, setAcFilter] = useState<'rated' | 'all' | 'in-contest'>('rated')
  const [acPage, setAcPage] = useState(0)

  useEffect(() => {
    if (!userId) return
    fetchSubmissions(userId)

    setRatingLoading(true)
    fetch(`${API_BASE}/user/ac_rank?user=${encodeURIComponent(userId)}`)
      .then((r) => r.json())
      .then((d) => setAtcoderRating(d?.rating ?? null))
      .catch(() => setAtcoderRating(null))
      .finally(() => setRatingLoading(false))
  }, [userId, fetchSubmissions])

  const acProblems = problems
    .filter((p) => acSet.has(p.id))
    .sort((a, b) => (acTimeMap.get(b.id) ?? 0) - (acTimeMap.get(a.id) ?? 0))

  const ratingBreakdown = (() => {
    if (problemsLoading || subLoading) return null
    const ratedProblems = acProblems.filter((p): p is typeof p & { difficulty: number } => p.difficulty !== null)
    // Exclude deprecated problems (≤2019) from rating weighting
    const weightedProblems = ratedProblems.filter(
      (p) => getProblemDeprecationLevel(p.contest_start_epoch_second) !== 'deprecated'
    )
    const top100Problems = [...weightedProblems]
      .sort((a, b) => b.difficulty - a.difficulty)
      .slice(0, 100)
    const top100TierNums = top100Problems.map((p) => getDifficultyTierNumber(p.difficulty))
    const tierSum = top100TierNums.reduce((acc, t) => acc + t, 0)
    const countBonus = Math.round(200 * (1 - Math.pow(0.995, weightedProblems.length)))
    return { tierSum, countBonus, total: tierSum + countBonus, top100Problems, top100TierNums, totalSolved: ratedProblems.length }
  })()

  const tierStats = (() => {
    const stats: Partial<Record<TierName, number>> = {}
    for (const p of acProblems) {
      const st = getSubTierFromDifficulty(p.difficulty)
      const tierName = 'level' in st ? st.tier : 'unrated'
      stats[tierName] = (stats[tierName] ?? 0) + 1
    }
    return stats
  })()

  const visibleAc = acFilter === 'all'
    ? acProblems
    : acFilter === 'in-contest'
      ? acProblems.filter((p) => {
          const firstAc = acFirstTimeMap.get(p.id)
          const contest = contestMap.get(p.contest_id)
          return firstAc !== undefined && contest !== undefined && firstAc >= contest.start && firstAc <= contest.end
        })
      : acProblems.filter((p) => p.difficulty !== null)
  const AC_PAGE_SIZE = 20
  const acTotalPages = Math.ceil(visibleAc.length / AC_PAGE_SIZE)
  const recentAc = visibleAc.slice(acPage * AC_PAGE_SIZE, (acPage + 1) * AC_PAGE_SIZE)
  const loading = problemsLoading || subLoading || ratingLoading || contestsLoading

  if (!userId) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/user" className="text-gray-500 hover:text-gray-300 text-sm">← User Search</Link>
        <h1 className="text-2xl font-bold text-white">{userId}</h1>
        <a href={`https://atcoder.jp/users/${userId}`} target="_blank" rel="noopener noreferrer"
          className="text-blue-400 hover:underline text-sm">
          AtCoder Profile ↗
        </a>
      </div>

      {loading ? (
        <div className="text-gray-500 py-12 text-center">Loading profile…</div>
      ) : (
        <>
          {/* AC Rating card */}
          {ratingBreakdown && (() => {
            const tier = getTierFromRating(ratingBreakdown.total)
            const { nextMin, progress } = getRatingProgressInfo(ratingBreakdown.total)
            const isRainbow = tier.color === 'rainbow'
            const tierColor = isRainbow ? '#aa00ff' : tier.color
            const rainbowStyle = {
              background: RAINBOW_GRADIENT,
              WebkitBackgroundClip: 'text' as const,
              WebkitTextFillColor: 'transparent' as const,
              backgroundClip: 'text' as const,
            }
            const tierLabel = tier.label

            return (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  <span>↗</span><span>AC Rating</span>
                </div>

                {/* Tier label + rating */}
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-2xl font-bold"
                    style={isRainbow ? rainbowStyle : { color: tierColor }}
                  >
                    {tierLabel}
                  </span>
                  <span
                    className="text-3xl font-bold"
                    style={isRainbow ? rainbowStyle : { color: tierColor }}
                  >
                    {ratingBreakdown.total.toLocaleString()}
                  </span>
                  {nextMin !== null && (
                    <span className="text-gray-500 text-sm ml-auto">
                      {nextMin - ratingBreakdown.total} pts to next tier
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${progress}%`,
                      background: isRainbow ? RAINBOW_GRADIENT : tierColor,
                    }}
                  />
                </div>

                {/* Top 100 breakdown */}
                <div>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <span className="text-gray-300">Top 100 problems difficulty sum</span>
                    <span className="text-gray-200 font-semibold">+{ratingBreakdown.tierSum.toLocaleString()}</span>
                  </div>
                  <Top100Grid
                    problems={ratingBreakdown.top100Problems}
                    acFirstTimeMap={acFirstTimeMap}
                    contestMap={contestMap}
                  />
                </div>

                {/* Count bonus */}
                <div className="flex justify-between items-center text-sm border-t border-gray-800 pt-3">
                  <span className="text-gray-400">
                    {ratingBreakdown.totalSolved} problems solved{' '}
                    <span className="text-gray-600 text-xs">
                      = ⌊200 × (1 − 0.995^{ratingBreakdown.totalSolved})⌋
                    </span>
                  </span>
                  <span className="text-gray-200 font-semibold">+{ratingBreakdown.countBonus.toLocaleString()}</span>
                </div>
              </div>
            )
          })()}

          {/* AtCoder official rating */}
          {atcoderRating !== null && (
            <RatingDisplay rating={atcoderRating} label="AtCoder Rating" sublabel="Official AtCoder rating" />
          )}

          {/* Solved by Tier */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Solved by Tier</h2>
            <div className="flex flex-wrap gap-4">
              {MAJOR_TIERS.map((tier) => {
                const count = tierStats[tier] ?? 0
                const repDifficulty = { bronze: 100, silver: 600, gold: 1000, platinum: 1500, diamond: 2100, master: 3000 }[tier]
                return (
                  <div key={tier} className="flex items-center gap-2">
                    <TierBadge difficulty={repDifficulty} showLabel majorTierOnly />
                    <span className="text-white font-bold text-lg">{count}</span>
                  </div>
                )
              })}
              {(tierStats['unrated'] ?? 0) > 0 && (
                <div className="flex items-center gap-2">
                  <TierBadge difficulty={null} showLabel />
                  <span className="text-white font-bold text-lg">{tierStats['unrated']}</span>
                </div>
              )}
            </div>
          </div>

          {/* Recent AC */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Recent AC ({visibleAc.length} total)
              </h2>
              <button
                onClick={() => {
                  setAcFilter((f) => f === 'rated' ? 'all' : f === 'all' ? 'in-contest' : 'rated')
                  setAcPage(0)
                }}
                className="text-xs px-2 py-1 rounded border border-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
              >
                {acFilter === 'rated' ? 'Show All' : acFilter === 'all' ? 'In-Contest Only' : 'Show Rated'}
              </button>
            </div>
            {recentAc.length === 0 ? (
              <p className="text-gray-600 text-sm">No AC submissions found.</p>
            ) : (
              <>
                <div className="space-y-2">
                  {recentAc.map((p) => {
                    const firstAc = acFirstTimeMap.get(p.id)
                    const contest = contestMap.get(p.contest_id)
                    const solvedInContest =
                      firstAc !== undefined &&
                      contest !== undefined &&
                      firstAc >= contest.start &&
                      firstAc <= contest.end
                    return (
                      <div key={p.id} className="flex items-center gap-3 text-sm">
                        <div className="w-20 flex-shrink-0">
                          <TierBadge difficulty={p.difficulty} showLabel bright={solvedInContest} startEpochSecond={p.contest_start_epoch_second} />
                        </div>
                        <span className="text-gray-500 font-mono text-xs w-20">
                          {p.contest_id.toUpperCase()}{p.problem_index}
                        </span>
                        <a href={`https://atcoder.jp/contests/${p.contest_id}/tasks/${p.id}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-blue-400 hover:underline flex-1 truncate">
                          {p.title || p.name}
                        </a>
                        {solvedInContest && (
                          <span className="text-yellow-400 text-xs font-semibold">IN</span>
                        )}
                        {p.difficulty !== null && (() => {
                          const clipped = clipDifficulty(p.difficulty!)
                          return <span style={{ color: getAtCoderColor(clipped).color }}>{clipped}</span>
                        })()}
                      </div>
                    )
                  })}
                </div>
                {acTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <button
                      onClick={() => setAcPage(0)}
                      disabled={acPage === 0}
                      className="px-2 py-1 text-xs rounded border border-gray-700 text-gray-400 disabled:opacity-30 hover:not-disabled:text-gray-200"
                    >
                      «
                    </button>
                    <button
                      onClick={() => setAcPage((p) => p - 1)}
                      disabled={acPage === 0}
                      className="px-2 py-1 text-xs rounded border border-gray-700 text-gray-400 disabled:opacity-30 hover:not-disabled:text-gray-200"
                    >
                      ‹
                    </button>
                    <span className="text-gray-500 text-xs">
                      {acPage + 1} / {acTotalPages}
                    </span>
                    <button
                      onClick={() => setAcPage((p) => p + 1)}
                      disabled={acPage === acTotalPages - 1}
                      className="px-2 py-1 text-xs rounded border border-gray-700 text-gray-400 disabled:opacity-30 hover:not-disabled:text-gray-200"
                    >
                      ›
                    </button>
                    <button
                      onClick={() => setAcPage(acTotalPages - 1)}
                      disabled={acPage === acTotalPages - 1}
                      className="px-2 py-1 text-xs rounded border border-gray-700 text-gray-400 disabled:opacity-30 hover:not-disabled:text-gray-200"
                    >
                      »
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
