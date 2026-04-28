import { ALL_SUB_TIERS } from '../config/tierConfig'
import { CONTEST_TYPES, type ContestType } from '../types'

// tierFromIdx: -1 = Unrated, 0~29 = Bronze5~Ruby1
// tierToIdx: always 0~29
export interface FilterState {
  tierFromIdx: number
  tierToIdx: number
  contestTypes: Set<ContestType['id']>
  ratingMin: string
  ratingMax: string
  sortKey: 'rating' | 'solvers'
  sortDir: 'asc' | 'desc'
}

export function defaultFilters(): FilterState {
  return {
    tierFromIdx: -1,
    tierToIdx: ALL_SUB_TIERS.length - 1,
    contestTypes: new Set(CONTEST_TYPES.map((c) => c.id)),
    ratingMin: '',
    ratingMax: '',
    sortKey: 'rating',
    sortDir: 'asc',
  }
}

interface FilterPanelProps {
  filters: FilterState
  onChange: (f: FilterState) => void
}

const TIER_AC_COLORS: Record<string, string> = {
  bronze:   '#CD7F32',
  silver:   '#C0C0C0',
  gold:     '#FFD700',
  platinum: '#00B8D4',
  diamond:  '#1E90FF',
  master:   '#9333EA',
}

export default function FilterPanel({ filters, onChange }: FilterPanelProps) {
  function toggleContest(id: ContestType['id']) {
    const next = new Set(filters.contestTypes)
    next.has(id) ? next.delete(id) : next.add(id)
    onChange({ ...filters, contestTypes: next })
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4">
      {/* Tier range */}
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Tier Range</p>
        <div className="flex items-center gap-2 flex-wrap">
          <TierSelect
            value={filters.tierFromIdx}
            max={filters.tierToIdx}
            includeUnrated
            onChange={(v) => onChange({ ...filters, tierFromIdx: v })}
            label="From"
          />
          <span className="text-gray-600 text-sm">~</span>
          <TierSelect
            value={filters.tierToIdx}
            min={Math.max(0, filters.tierFromIdx)}
            onChange={(v) => onChange({ ...filters, tierToIdx: v })}
            label="To"
          />
        </div>
      </div>

      {/* Quick tier buttons */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onChange({ ...filters, tierFromIdx: -1, tierToIdx: ALL_SUB_TIERS.length - 1 })}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold border border-gray-600 transition-opacity text-gray-400 ${
            filters.tierFromIdx === -1 && filters.tierToIdx === ALL_SUB_TIERS.length - 1 ? 'opacity-100' : 'opacity-35 hover:opacity-60'
          }`}
        >
          All
        </button>
        <button
          onClick={() => onChange({ ...filters, tierFromIdx: -1, tierToIdx: -1 })}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold border border-gray-500 transition-opacity text-gray-400 ${
            filters.tierFromIdx === -1 && filters.tierToIdx === -1 ? 'opacity-100' : 'opacity-35 hover:opacity-60'
          }`}
        >
          Unrated
        </button>
        {Object.entries(TIER_AC_COLORS).map(([tier, color]) => {
          const fromIdx = ALL_SUB_TIERS.findIndex((st) => st.tier === tier && st.level === 5)
          const toIdx = ALL_SUB_TIERS.findIndex((st) => st.tier === tier && st.level === 1)
          const active = filters.tierFromIdx === fromIdx && filters.tierToIdx === toIdx
          return (
            <button
              key={tier}
              onClick={() => onChange({ ...filters, tierFromIdx: fromIdx, tierToIdx: toIdx })}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-opacity ${active ? 'opacity-100' : 'opacity-35 hover:opacity-60'}`}
              style={{ color, borderColor: color }}
            >
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </button>
          )
        })}
      </div>

      {/* Contest type */}
      <div>
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Contest Type</p>
        <div className="flex flex-wrap gap-2">
          {CONTEST_TYPES.map((c) => (
            <button
              key={c.id}
              onClick={() => toggleContest(c.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border border-gray-600 transition-opacity ${
                filters.contestTypes.has(c.id)
                  ? 'bg-gray-700 text-white opacity-100'
                  : 'bg-transparent text-gray-500 opacity-40'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rating range + sort */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Rating Range</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.ratingMin}
              onChange={(e) => onChange({ ...filters, ratingMin: e.target.value })}
              className="w-24 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
            <span className="text-gray-600">–</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.ratingMax}
              onChange={(e) => onChange({ ...filters, ratingMax: e.target.value })}
              className="w-24 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Sort</p>
          <div className="flex gap-2">
            {(['rating', 'solvers'] as const).map((key) => (
              <button
                key={key}
                onClick={() => {
                  if (filters.sortKey === key) {
                    onChange({ ...filters, sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc' })
                  } else {
                    onChange({ ...filters, sortKey: key, sortDir: 'asc' })
                  }
                }}
                className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                  filters.sortKey === key
                    ? 'bg-blue-700 border-blue-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                }`}
              >
                {key === 'rating' ? 'Rating' : 'Solvers'}
                {filters.sortKey === key && (filters.sortDir === 'asc' ? ' ↑' : ' ↓')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TierSelect({
  value,
  min = 0,
  max = ALL_SUB_TIERS.length - 1,
  includeUnrated = false,
  onChange,
  label,
}: {
  value: number
  min?: number
  max?: number
  includeUnrated?: boolean
  onChange: (v: number) => void
  label: string
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-gray-500 text-xs">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-blue-500"
      >
        {includeUnrated && (
          <option value={-1} style={{ color: '#6B7280' }}>Unrated</option>
        )}
        {ALL_SUB_TIERS.map((st, idx) => (
          <option
            key={idx}
            value={idx}
            disabled={idx < min || idx > max}
          >
            {st.label}
          </option>
        ))}
      </select>
    </div>
  )
}
