import { useState } from 'react'
import { Download, Search, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react'
import { AUDIT_EVENTS } from '../lib/mockData'
import { formatRelativeTime } from '../lib/utils'

export default function AuditLogsPage() {
  const [search, setSearch] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)

  const filtered = AUDIT_EVENTS.filter(
    (e) =>
      e.event.toLowerCase().includes(search.toLowerCase()) ||
      e.namespace.toLowerCase().includes(search.toLowerCase()) ||
      e.actor.toLowerCase().includes(search.toLowerCase()) ||
      e.incident_id.toLowerCase().includes(search.toLowerCase())
  )

  const exportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(AUDIT_EVENTS, null, 2))
    const dlAnchorElem = document.createElement('a')
    dlAnchorElem.setAttribute('href', dataStr)
    dlAnchorElem.setAttribute('download', `healmesh-audit-export-${Date.now()}.json`)
    dlAnchorElem.click()
  }

  const getEventBadge = (event: string) => {
    if (event.includes('GROQ')) return 'bg-hm-teal/15 text-hm-teal border-hm-teal/30'
    if (event.includes('APPROVED') || event.includes('EXECUTED'))
      return 'bg-hm-emerald/15 text-hm-emerald border-hm-emerald/30'
    return 'bg-white/10 text-white/70 border-white/10'
  }

  return (
    <div className="p-4 md:p-6 max-w-[1700px] mx-auto w-full space-y-6 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
        <div>
          <div className="label-style text-hm-teal flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-hm-emerald" /> Append-Only Immutable Records
          </div>
          <h1 className="text-2xl font-bold font-display text-white mt-0.5">AUDIT LOGS</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-hm-teal/50 w-64"
            />
          </div>

          <button
            onClick={exportJSON}
            className="btn-ghost text-xs flex items-center gap-1.5 py-2 px-4"
          >
            <Download size={14} /> Export JSON
          </button>
        </div>
      </div>

      {/* Audit Table */}
      <div className="glass-card rounded-2xl overflow-hidden flex-1 flex flex-col border border-white/10">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-black/50 border-b border-white/10 text-white/40 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Incident ID</th>
                <th className="py-3.5 px-4">Pipeline Event</th>
                <th className="py-3.5 px-4">Namespace</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Merkle / Hash</th>
                <th className="py-3.5 px-4 text-center">Verified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedEvent(selectedEvent === item.id ? null : item.id)}
                  className="hover:bg-white/[0.03] transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4 text-white/50">{formatRelativeTime(item.timestamp)}</td>
                  <td className="py-3.5 px-4 text-hm-teal font-semibold">{item.incident_id}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded border text-[10px] ${getEventBadge(item.event)}`}>
                      {item.event}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-white/90">{item.namespace}</td>
                  <td className="py-3.5 px-4 text-hm-amber font-semibold">{item.action}</td>
                  <td className="py-3.5 px-4 text-white/60">{item.actor}</td>
                  <td className="py-3.5 px-4 text-white/40 text-[11px]">{item.hash}</td>
                  <td className="py-3.5 px-4 text-center">
                    {item.verified ? (
                      <CheckCircle2 size={16} className="text-hm-emerald inline" />
                    ) : (
                      <XCircle size={16} className="text-hm-crimson inline" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
