import type { ConfidenceLevel } from '../../lib/types'
import { getConfidenceColor, getConfidenceLabel } from '../../lib/utils'

export default function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const color = getConfidenceColor(level)
  const label = getConfidenceLabel(level)
  return (
    <span
      className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
      style={{ color, background: `${color}18`, border: `1px solid ${color}33` }}
    >
      <span className="text-sm leading-none">⬢</span>
      {label}
    </span>
  )
}
