import { useState } from 'react'
import { Hexagon, Zap, Terminal, Activity } from 'lucide-react'
import { useHealth } from '../../hooks/useHealth'

export default function DashboardNavbar() {
  const { data: health, isError } = useHealth()
  const [showTooltip, setShowTooltip] = useState(false)
  const coreHealthy = !isError && health?.status === 'ok'

  return (
    <nav
      className="sticky top-0 z-50 flex items-center gap-3 px-6 py-3 flex-shrink-0"
      style={{
        background: 'linear-gradient(180deg, rgba(24, 44, 72, 0.85) 0%, rgba(19, 34, 56, 0.75) 100%)',
        backdropFilter: 'blur(28px)',
        borderBottom: '1px solid rgba(255,255,255,0.18)',
        boxShadow: '0 4px 20px rgba(5, 16, 36, 0.25)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 mr-3">
        <Hexagon size={20} className="text-hm-cyan flex-shrink-0" fill="rgba(56,189,248,0.2)" />
        <div className="min-w-0">
          <div className="font-serif font-bold text-base text-white leading-none">HealMesh</div>
          <div className="text-[10px] text-white/50 font-serif leading-none mt-1 whitespace-nowrap">
            Autonomous Kubernetes Self-Healing
          </div>
        </div>
      </div>

      {/* Cluster */}
      <div className="nav-pill flex-shrink-0">
        <span className="w-2 h-2 rounded-full bg-hm-emerald flex-shrink-0 shadow-[0_0_8px_#10B981]" />
        <span className="text-xs text-white/90 font-serif whitespace-nowrap">healmesh-test (demo cluster)</span>
        <span className="badge-demo">DEMO</span>
      </div>

      {/* Incidents */}
      <div
        className="nav-pill flex-shrink-0"
        style={{ borderColor: 'rgba(249,115,22,0.4)', background: 'rgba(249,115,22,0.12)' }}
      >
        <span className="w-2 h-2 rounded-full bg-hm-rust animate-pulse-slow flex-shrink-0 shadow-[0_0_8px_#F97316]" />
        <span className="text-xs text-hm-rust font-serif font-bold whitespace-nowrap">3 Active Outages</span>
      </div>

      <div className="flex-1" />

      {/* Gemini badge */}
      <div className="relative flex-shrink-0">
        <button
          className="flex items-center gap-1.5 text-hm-cyan text-xs hover:text-white transition-colors py-1.5 px-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <Zap size={13} className="text-cyan-400" />
          <span className="font-serif font-bold whitespace-nowrap">Gemini · 2.5 Flash</span>
        </button>
        {showTooltip && (
          <div className="absolute top-full right-0 mt-2 glass-card p-4 w-60 z-50 text-left border-t border-white/40 shadow-2xl">
            <div className="label-style mb-2 text-hm-cyan">Inference Engine</div>
            <div className="space-y-1 text-xs text-white/80 font-serif">
              <div>Provider: <strong className="text-white">Google AI Studio</strong></div>
              <div className="font-mono text-[11px] text-hm-cyan">Model: gemini-2.5-flash</div>
              <div className="text-white/50 text-[11px]">Direct SDK invocation (zero middleware)</div>
            </div>
          </div>
        )}
      </div>

      {/* Health */}
      <div className="nav-pill flex-shrink-0">
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            coreHealthy ? 'bg-hm-emerald shadow-[0_0_8px_#10B981]' : 'bg-hm-rust shadow-[0_0_8px_#F97316]'
          }`}
        />
        <span className="text-xs text-white/80 font-serif whitespace-nowrap">
          Core API: {coreHealthy ? 'Healthy' : 'Offline'}
        </span>
      </div>
      <div className="nav-pill flex-shrink-0">
        <span className="w-2 h-2 rounded-full bg-hm-emerald flex-shrink-0 shadow-[0_0_8px_#10B981]" />
        <span className="text-xs text-white/80 font-serif whitespace-nowrap">Watcher: Connected</span>
      </div>

      {/* Cmd K */}
      <div className="nav-pill flex-shrink-0 cursor-pointer hover:bg-white/15 transition-colors">
        <Terminal size={11} className="text-white/60" />
        <span className="font-mono text-[11px] text-white/60">⌘ K</span>
      </div>
    </nav>
  )
}
