import { useState, useMemo } from 'react'
import { useProblems } from '../hooks/useProblems'
import ProblemTable from '../components/ProblemTable'
import FilterPanel, { defaultFilters, type FilterState } from '../components/FilterPanel'
import { getSubTierFromDifficulty } from '../utils/tierConverter'
import { ALL_SUB_TIERS } from '../config/tierConfig'
import { getContestType } from '../types'

export default function ProblemList() {
  const { problems, loading } = useProblems()
  const [filters, setFilters] = useState<FilterState>(defaultFilters())
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  function handleFiltersChange(f: FilterState) {
    setFilters(f)
    setPage(1)
  }

  function handleSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  const filteredProblems = useMemo(() => {
    const ratingMin = filters.ratingMin !== '' ? Number(filters.ratingMin) : null
    const ratingMax = filters.ratingMax !== '' ? Number(filters.ratingMax) : null
    const q = search.trim().toLowerCase()

    return problems
      .filter((p) => {
        if (!filters.contestTypes.has(getContestType(p.contest_id))) return false

        if (q) {
          const displayId = `${p.contest_id}${p.problem_index}`.toLowerCase()
          const titleMatch = (p.title || p.name).toLowerCase().includes(q)
          const idMatch = displayId.includes(q) || p.id.toLowerCase().includes(q)
          if (!titleMatch && !idMatch) return false
        }

        if (p.difficulty === null) return filters.tierFromIdx === -1

        const st = getSubTierFromDifficulty(p.difficulty)
        if (!('level' in st)) return false
        const idx = ALL_SUB_TIERS.indexOf(st)
        if (idx < Math.max(0, filters.tierFromIdx) || idx > filters.tierToIdx) return false

        if (ratingMin !== null && p.difficulty < ratingMin) return false
        if (ratingMax !== null && p.difficulty > ratingMax) return false

        return true
      })
      .sort((a, b) => {
        const dir = filters.sortDir === 'asc' ? 1 : -1
        if (filters.sortKey === 'rating') {
          return ((a.difficulty ?? -1) - (b.difficulty ?? -1)) * dir
        }
        return ((a.solver_count ?? 0) - (b.solver_count ?? 0)) * dir
      })
  }, [problems, filters, search])

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search by title or problem ID (e.g. ABC300A)"
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
      />

      <FilterPanel filters={filters} onChange={handleFiltersChange} />

      <ProblemTable
        problems={filteredProblems}
        loading={loading}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
      />
    </div>
  )
}
