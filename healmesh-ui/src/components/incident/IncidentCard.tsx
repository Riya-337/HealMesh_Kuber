import { ChevronRight } from 'lucide-react'
import type { Diagnosis } from '../../lib/types'
import { formatRelativeTime, getSeverityClass, getFailureColor } from '../../lib/utils'
import { useIncidentStore } from '../../hooks/useIncidentStore'

export default function IncidentCard({ diagnosis }: { diagnosis: Diagnosis }) {
  const selectIncident = useIncidentStore(s => s.selectIncident)
  return (
    <button
      onClick={() => selectIncident(diagnosis)}
      className={`w-full text-left glass-card-hover px-3 py-2.5 flex items-center gap-3 ${getSeverityClass(diagnosis.failure_type)}`}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: getFailureColor(diagnosis.failure_type), boxShadow: `0 0 5px ${getFailureColor(diagnosis.failure_type)}` }}
      />
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[12px] text-white truncate leading-tight">{diagnosis.pod_name}</div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="badge-incident text-[10px] px-1.5 py-0">{diagnosis.failure_type}</span>
          <span className="text-[10px] text-white/30">{diagnosis.namespace}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 text-white/30 flex-shrink-0">
        <span className="text-[11px]">{formatRelativeTime(diagnosis.created_at)}</span>
        <ChevronRight size={11} />
      </div>
    </button>
  )
}
