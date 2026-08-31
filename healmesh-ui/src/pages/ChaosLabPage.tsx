import { useState } from 'react'
import { Zap, AlertOctagon, Terminal, Flame, RefreshCw, Cpu, Layers } from 'lucide-react'
import { useIncidentStore } from '../hooks/useIncidentStore'
import { MOCK_DIAGNOSES } from '../lib/mockData'
import type { FailureType } from '../lib/types'

const SCENARIOS: {
  title: string
  type: FailureType
  icon: any
  namespace: string
  description: string
  color: string
}[] = [
  {
    title: 'Inject CrashLoopBackOff',
    type: 'CrashLoopBackOff',
    icon: Flame,
    namespace: 'batch-jobs',
    description: 'Forces database connection timeout leading to rapid container exit loops.',
    color: '#C17B3A',
  },
  {
    title: 'Trigger OOMKilled Burst',
    type: 'OOMKilled',
    icon: AlertOctagon,
    namespace: 'payments',
    description: 'Simulates memory leak in cache layer exceeding container limit.',
    color: '#DC2626',
  },
  {
    title: 'Simulate Bad Image Tag',
    type: 'ImagePullBackOff',
    icon: Layers,
    namespace: 'default',
    description: 'Deploys an unpushed release candidate causing ErrImagePull.',
    color: '#F59E0B',
  },
  {
    title: 'Trip Readiness Probe',
    type: 'FailedRollout',
    icon: RefreshCw,
    namespace: 'monitoring',
    description: 'Fails HTTP health checks causing rolling update halt.',
    color: '#00F0FF',
  },
]

export default function ChaosLabPage() {
  const addSimulated = useIncidentStore((s) => s.addSimulated)
  const [history, setHistory] = useState<string[]>([])

  const handleInject = (scenario: typeof SCENARIOS[0]) => {
    const base = MOCK_DIAGNOSES[0]
    addSimulated({
      ...base,
      id: `sim-${Date.now()}`,
      incident_id: `sim-inc-${Date.now()}`,
      created_at: new Date().toISOString(),
      failure_type: scenario.type,
      namespace: scenario.namespace,
      pod_name: `sim-pod-${Math.random().toString(36).substring(2, 7)}`,
      root_cause: `[SIMULATED] ${scenario.description}`,
    })

    setHistory((prev) => [
      `[${new Date().toLocaleTimeString()}] ${scenario.type} injected in ${scenario.namespace}`,
      ...prev,
    ])
  }

  return (
    <div className="p-4 md:p-6 max-w-[1500px] mx-auto w-full space-y-6 overflow-y-auto h-full">
      {/* Simulation Banner */}
      <div className="p-4 rounded-2xl bg-hm-amber/10 border border-hm-amber/30 flex items-start gap-3">
        <Zap className="text-hm-amber flex-shrink-0 mt-0.5" size={18} />
        <div className="text-xs text-white/80 leading-relaxed">
          <strong className="text-hm-amber font-semibold">⚡ Simulation Mode:</strong> These
          scenarios trigger simulated frontend & telemetry events for demonstration. Real Kubernetes
          fault injection is executed via <code className="text-hm-teal font-mono">infra/scripts/inject_failure.sh</code>.
        </div>
      </div>

      {/* Header */}
      <div>
        <div className="label-style text-hm-amber">Chaos Engineering & Fault Injection</div>
        <h1 className="text-2xl font-bold font-display text-white mt-0.5">CHAOS LAB</h1>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SCENARIOS.map((sc) => (
          <div
            key={sc.title}
            className="glass-card p-6 rounded-2xl flex flex-col justify-between border-l-4"
            style={{ borderLeftColor: sc.color }}
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${sc.color}20`, color: sc.color }}
                >
                  <sc.icon size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">{sc.title}</h3>
                  <span className="text-xs font-mono text-white/40">Target NS: {sc.namespace}</span>
                </div>
              </div>

              <p className="text-sm text-white/70 leading-relaxed mb-6">{sc.description}</p>
            </div>

            <button
              onClick={() => handleInject(sc)}
              className="btn-primary text-xs py-2.5 flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(90deg, ${sc.color}, #0083B0)` }}
            >
              <Zap size={14} /> Inject Failure Event
            </button>
          </div>
        ))}
      </div>

      {/* Timeline Log */}
      {history.length > 0 && (
        <div className="glass-card p-5 rounded-2xl space-y-2">
          <div className="label-style">Simulation Event Log</div>
          <div className="space-y-1 font-mono text-xs text-white/60">
            {history.map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-hm-teal">›</span> {h}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
