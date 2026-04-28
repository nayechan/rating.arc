import type { MergedProblem, SolveStatus } from '../types'
import TierBadge from './TierBadge'
import { clipDifficulty } from '../utils/tierConverter'
import { getAtCoderColor } from '../utils/atcoderColors'

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200]

interface ProblemTableProps {
  problems: MergedProblem[]
  acSet?: Set<string>
  triedSet?: Set<string>
  loading?: boolean
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

function getStatus(id: string, acSet?: Set<string>, triedSet?: Set<string>): SolveStatus {
  if (!acSet && !triedSet) return '-'
  if (acSet?.has(id)) return 'AC'
  if (triedSet?.has(id)) return 'Tried'
  return '-'
}

const STATUS_STYLE: Record<SolveStatus, string> = {
  'AC':    'text-green-400 font-semibold',
  'Tried': 'text-yellow-400',
  '-':     'text-gray-600',
}

function ProblemRow({ problem, acSet, triedSet }: { problem: MergedProblem; acSet?: Set<string>; triedSet?: Set<string> }) {
  const status = getStatus(problem.id, acSet, triedSet)
  const problemUrl = `https://atcoder.jp/contests/${problem.contest_id}/tasks/${problem.id}`
  const displayId = `${problem.contest_id.toUpperCase()}${problem.problem_index}`

  const rowBg =
    status === 'AC'    ? 'bg-green-950/30 hover:bg-green-950/50' :
    status === 'Tried' ? 'bg-yellow-950/20 hover:bg-yellow-950/40' :
                         'hover:bg-gray-800/50'

  return (
    <tr className={`border-b border-gray-800 transition-colors ${rowBg}`}>
      <td className="px-4 py-2.5 w-28">
        <TierBadge difficulty={problem.difficulty} startEpochSecond={problem.contest_start_epoch_second} />
      </td>
      <td className="px-4 py-2.5 font-mono text-sm text-gray-300 w-28">{displayId}</td>
      <td className="px-4 py-2.5">
        <a href={problemUrl} target="_blank" rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 hover:underline">
          {problem.title || problem.name}
        </a>
      </td>
      <td className="px-4 py-2.5 text-right text-sm w-24">
        {problem.difficulty !== null ? (() => {
          const clipped = clipDifficulty(problem.difficulty!)
          const ac = getAtCoderColor(clipped)
          return <span style={{ color: ac.color }}>{clipped}</span>
        })() : <span className="text-gray-600">Unrated</span>}
      </td>
      <td className="px-4 py-2.5 text-right text-sm text-gray-400 w-24">
        {problem.solver_count !== null ? problem.solver_count.toLocaleString() : '—'}
      </td>
      {(acSet || triedSet) && (
        <td className="px-4 py-2.5 text-center w-20">
          <span className={`text-sm ${STATUS_STYLE[status]}`}>{status}</span>
        </td>
      )}
    </tr>
  )
}

function Pagination({
  page, pageSize, total, onPageChange, onPageSizeChange,
}: {
  page: number; pageSize: number; total: number
  onPageChange: (p: number) => void
  onPageSizeChange: (s: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  // Generate page number buttons: always show first, last, current ±2
  const pages: (number | '…')[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-gray-900 border-t border-gray-800">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>{total.toLocaleString()} problems</span>
        {total > 0 && <span>({start.toLocaleString()}–{end.toLocaleString()})</span>}
        <select
          value={pageSize}
          onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1) }}
          className="bg-gray-800 border border-gray-700 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none ml-1"
        >
          {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s} / page</option>)}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <PageBtn onClick={() => onPageChange(1)} disabled={page === 1}>«</PageBtn>
        <PageBtn onClick={() => onPageChange(page - 1)} disabled={page === 1}>‹</PageBtn>
        {pages.map((p, i) =>
          p === '…'
            ? <span key={`e${i}`} className="px-1.5 text-gray-600 text-xs">…</span>
            : <PageBtn key={p} onClick={() => onPageChange(p)} active={p === page}>{p}</PageBtn>
        )}
        <PageBtn onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>›</PageBtn>
        <PageBtn onClick={() => onPageChange(totalPages)} disabled={page === totalPages}>»</PageBtn>
      </div>
    </div>
  )
}

function PageBtn({ children, onClick, disabled, active }: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[28px] h-7 px-1.5 rounded text-xs font-medium transition-colors
        ${active ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'}
        ${disabled ? 'opacity-30 cursor-not-allowed' : ''}
      `}
    >
      {children}
    </button>
  )
}

export default function ProblemTable({
  problems, acSet, triedSet, loading,
  page, pageSize, onPageChange, onPageSizeChange,
}: ProblemTableProps) {
  const showStatus = !!(acSet || triedSet)
  const paginated = problems.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="rounded-xl border border-gray-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-900 border-b border-gray-800">
              <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Tier</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Problem</th>
              <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">Solvers</th>
              {showStatus && <th className="px-4 py-3 text-center text-xs text-gray-500 uppercase tracking-wider">Status</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">Loading problems…</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">No problems match the current filters.</td></tr>
            ) : (
              paginated.map((p) => (
                <ProblemRow key={p.id} problem={p} acSet={acSet} triedSet={triedSet} />
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        pageSize={pageSize}
        total={problems.length}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  )
}
