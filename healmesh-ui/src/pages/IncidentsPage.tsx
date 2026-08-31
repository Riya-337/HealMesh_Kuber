import { useState } from 'react'
import { AlertCircle, Terminal, Copy, CheckCircle, Search, Filter } from 'lucide-react'
import { useDiagnoses } from '../hooks/useDiagnoses'
import { useIncidentStore } from '../hooks/useIncidentStore'
import ConfidenceBadge from '../components/incident/ConfidenceBadge'
import LogSnippet from '../components/incident/LogSnippet'
import ActionPanel from '../components/incident/ActionPanel'
import type { Diagnosis, FailureType } from '../lib/types'
import { formatRelativeTime, getFailureColor } from '../lib/utils'

const FILTERS: (FailureType | 'ALL')[] = [
  'ALL',
  'CrashLoopBackOff',
  'OOMKilled',
  'ImagePullBackOff',
  'FailedRollout',
  'ResourceQuotaExceeded',
]

export default function IncidentsPage() {
  const { diagnoses } = useDiagnoses()
  const simulatedIncidents = useIncidentStore((s) => s.simulatedIncidents)
  const allIncidents = [...simulatedIncidents, ...diagnoses]

  const [activeFilter, setActiveFilter] = useState<FailureType | 'ALL'>('ALL')
  const [search, setSearch] = useState('')
  const [selectedIncident, setSelectedIncident] = useState<Diagnosis>(allIncidents[0])
  const [copied, setCopied] = useState(false)

  const filtered = allIncidents.filter((inc) => {
    const matchesFilter = activeFilter === 'ALL' || inc.failure_type === activeFilter
    const matchesSearch =
      inc.pod_name.toLowerCase().includes(search.toLowerCase()) ||
      inc.namespace.toLowerCase().includes(search.toLowerCase()) ||
      inc.failure_type.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleCopy = (cmd: string) => {
    navigator.clipboard.writeText(cmd)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-4 md:p-6 h-full flex flex-col space-y-4 max-w-[1700px] mx-auto w-full overflow-hidden">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
        <div>
          <div className="label-style text-hm-teal">Incident Triage & Root Cause Intelligence</div>
          <h1 className="text-2xl font-bold font-display text-white mt-0.5">INCIDENTS / AI DIAGNOSIS</h1>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-black/30 p-1 rounded-xl border border-white/10">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                activeFilter === f
                  ? 'bg-hm-teal/20 text-hm-teal border border-hm-teal/30'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Split Workspace View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden min-h-0">
        {/* Left Side: Incident Stream List (5 cols) */}
        <div className="lg:col-span-5 glass-card p-4 rounded-2xl flex flex-col min-h-0 overflow-hidden">
          {/* Search bar */}
          <div className="relative mb-3 flex-shrink-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search by pod, namespace, or failure type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-hm-teal/50"
            />
          </div>

          {/* Incident Rows */}
          <div className="space-y-2 overflow-y-auto pr-1 flex-1">
            {filtered.map((inc) => {
              const isSelected = selectedIncident?.id === inc.id
              const color = getFailureColor(inc.failure_type)
              return (
                <button
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`w-full text-left p-3 rounded-xl transition-all border ${
                    isSelected
                      ? 'bg-white/10 border-hm-teal/40 shadow-lg'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-mono text-xs font-semibold text-white truncate max-w-[200px]">
                        {inc.pod_name}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/40 font-mono">
                      {formatRelativeTime(inc.created_at)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge-incident text-[10px] py-0 px-2">{inc.failure_type}</span>
                    <span className="text-[10px] text-white/40 font-mono">ns: {inc.namespace}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Side: Full Dedicated Diagnosis Workspace (7 cols) */}
        <div className="lg:col-span-7 glass-card p-6 rounded-2xl flex flex-col overflow-y-auto min-h-0 space-y-5">
          {selectedIncident ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: getFailureColor(selectedIncident.failure_type) }}
                    />
                    <h2 className="font-mono text-lg font-bold text-white">
                      {selectedIncident.pod_name}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/50 font-mono">
                    <span>Namespace: <strong className="text-white">{selectedIncident.namespace}</strong></span>
                    <span>·</span>
                    <span>Node: <strong className="text-white">demo-node-e</strong></span>
                  </div>
                </div>
                <ConfidenceBadge level={selectedIncident.confidence} />
              </div>

              {/* AI Root Cause */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="label-style">AI Root Cause</span>
                  <span className="text-[11px] text-hm-teal font-mono">(Groq · Llama 3.1 · 8B)</span>
                </div>
                <div className="p-4 rounded-xl bg-hm-teal/[0.04] border border-hm-teal/20 text-white/90 text-sm leading-relaxed">
                  {selectedIncident.root_cause}
                </div>
              </div>

              {/* Suggested Command */}
              {selectedIncident.suggested_manual_command && (
                <div>
                  <div className="label-style mb-2">Suggested Manual Command</div>
                  <div className="relative group">
                    <pre className="font-mono text-xs p-3.5 rounded-xl bg-black/40 border border-white/10 text-hm-emerald overflow-x-auto">
                      {selectedIncident.suggested_manual_command}
                    </pre>
                    <button
                      onClick={() => handleCopy(selectedIncident.suggested_manual_command!)}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/60 hover:text-white transition-colors"
                      title="Copy command"
                    >
                      {copied ? <CheckCircle size={14} className="text-hm-emerald" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Log Snippet */}
              <div>
                <div className="label-style mb-2">Error Log Snippet (Last 50 lines)</div>
                <LogSnippet lines={selectedIncident.log_snippet} />
              </div>

              {/* Proposed Action */}
              <div className="pt-2 border-t border-white/10">
                <ActionPanel
                  action={selectedIncident.parsed_action}
                  namespace={selectedIncident.namespace}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white/30 text-sm">
              <AlertCircle size={32} className="mb-2 opacity-50" />
              Select an incident from the stream to view full diagnosis
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
