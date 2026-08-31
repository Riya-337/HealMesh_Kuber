import { Clock, RefreshCw, Layers, ArrowRight, ShieldAlert, Cpu, Activity } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import ClusterCanvas from '../components/three/ClusterCanvas'
import IncidentCard from '../components/incident/IncidentCard'
import { useDiagnoses } from '../hooks/useDiagnoses'
import { useIncidentStore } from '../hooks/useIncidentStore'
import { formatDynamicDate, formatLatency } from '../lib/utils'

export default function OverviewPage() {
  const { diagnoses, stats, isLoading, refetch } = useDiagnoses()
  const simulatedIncidents = useIncidentStore((s) => s.simulatedIncidents)

  const allIncidents = [...simulatedIncidents, ...diagnoses]

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-64px)] p-5 md:p-8 space-y-6 max-w-[1850px] mx-auto w-full">
      {/* 3D Spatial Mesh Command Canvas */}
      <div className="relative w-full h-[54vh] min-h-[420px] rounded-3xl overflow-hidden glass-card border-t border-white/50 border-l border-white/35 shadow-[0_25px_60px_rgba(5,16,36,0.5)]">
        {/* Floating Command Title Badge */}
        <div className="absolute top-5 left-6 z-10 pointer-events-none">
          <div className="label-style text-hm-cyan text-xs tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-hm-cyan animate-pulse" />
            Autonomous Kubernetes Control Mesh
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight mt-1">
            SPATIAL CLUSTER COCKPIT
          </h2>
          <div className="text-xs text-white/70 font-serif mt-0.5">
            healmesh-test (demo cluster) · 7 Connected Monitored Namespaces
          </div>
        </div>

        {/* 3D Spatial Canvas */}
        <ClusterCanvas />
      </div>

      {/* Unified Asymmetrical Command Console Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Side: Live Triage Stream (7 cols) */}
        <div className="lg:col-span-7 glass-card p-6 rounded-3xl flex flex-col justify-between border-t border-white/40">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <Activity size={18} className="text-hm-cyan" />
                <span className="font-serif font-bold text-base text-white">Live Incident Stream</span>
                <span className="badge-incident text-xs px-2.5 py-0.5">
                  {allIncidents.length} Pending
                </span>
              </div>
              <Link
                to="/dashboard/incidents"
                className="text-xs font-serif text-hm-cyan hover:text-white transition-colors flex items-center gap-1.5 font-bold"
              >
                <span>Full Workspace</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {allIncidents.map((diag) => (
                <IncidentCard key={diag.id} diagnosis={diag} />
              ))}
            </div>
          </div>

          <div className="text-xs text-white/60 font-serif pt-3 border-t border-white/10 mt-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-hm-emerald animate-ping" />
              client-go live watcher stream active
            </span>
            <span className="font-mono text-hm-cyan text-xs">Poll: 30s</span>
          </div>
        </div>

        {/* Right Side: Cluster Health Capsule (5 cols) */}
        <div className="lg:col-span-5 glass-card p-6 rounded-3xl flex flex-col justify-between border-t border-white/40">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <span className="font-serif font-bold text-base text-white">Real-Time Telemetry</span>
              <button
                onClick={() => refetch()}
                className="text-white/60 hover:text-white p-1 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-serif"
                title="Refresh Telemetry"
              >
                <span>Live /diagnoses</span>
                <RefreshCw size={13} className={isLoading ? 'animate-spin text-hm-cyan' : ''} />
              </button>
            </div>

            {/* 3 Telemetry Tiles with Specular Bevels */}
            <div className="grid grid-cols-3 gap-3">
              {/* Tile 1: Active Outages */}
              <div className="p-4 rounded-2xl bg-black/30 border border-white/15 flex flex-col justify-between shadow-inner">
                <div className="flex items-center justify-between text-hm-rust">
                  <ShieldAlert size={18} />
                  <span className="text-[10px] font-mono text-white/50">K8S</span>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-serif font-bold text-white tracking-tight">
                    {stats.activeCount || allIncidents.length}
                  </div>
                  <div className="text-xs text-white/70 font-serif mt-1">Active Outages</div>
                  <div className="text-[10px] text-hm-rust font-mono mt-0.5">Unresolved</div>
                </div>
              </div>

              {/* Tile 2: Diagnoses Today */}
              <div className="p-4 rounded-2xl bg-black/30 border border-white/15 flex flex-col justify-between shadow-inner">
                <div className="flex items-center justify-between text-hm-cyan">
                  <Layers size={18} />
                  <span className="text-[10px] font-mono text-white/50">AI</span>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-serif font-bold text-white tracking-tight">
                    {stats.todayCount || 27}
                  </div>
                  <div className="text-xs text-white/70 font-serif mt-1">Diagnoses Today</div>
                  <div className="text-[10px] text-white/50 font-mono mt-0.5 truncate" title={formatDynamicDate()}>
                    {formatDynamicDate()}
                  </div>
                </div>
              </div>

              {/* Tile 3: Avg Diagnosis Latency */}
              <div className="p-4 rounded-2xl bg-black/30 border border-white/15 flex flex-col justify-between shadow-inner">
                <div className="flex items-center justify-between text-hm-emerald">
                  <Clock size={18} />
                  <span className="text-[10px] font-mono text-white/50">GROQ</span>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-serif font-bold text-white tracking-tight">
                    {formatLatency(stats.avgLatency || 842)}
                  </div>
                  <div className="text-xs text-white/70 font-serif mt-1">Avg Latency</div>
                  <div className="text-[10px] text-hm-emerald font-mono mt-0.5">llama-3.1-8b</div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-white/60 font-serif pt-3 border-t border-white/10 mt-3 flex items-center justify-between">
            <span>Namespace Guardrails: <strong className="text-hm-emerald font-semibold">Active</strong></span>
            <span>Closed-Enum Enforced</span>
          </div>
        </div>
      </div>
    </div>
  )
}
