import { Shield, Database, Sliders, Check } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto w-full space-y-6 overflow-y-auto h-full">
      <div>
        <div className="label-style text-hm-teal">Cluster Configuration & Invariants</div>
        <h1 className="text-2xl font-bold font-display text-white mt-0.5">SETTINGS</h1>
      </div>

      <div className="space-y-4">
        {/* Core Guardrails */}
        <div className="glass-card p-6 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Shield size={18} className="text-hm-emerald" /> Hardcoded Namespace Denylist
          </div>
          <p className="text-xs text-white/60">
            These namespaces can never be mutated by any automated or semi-automated action:
          </p>
          <div className="flex gap-2 font-mono text-xs">
            <span className="px-3 py-1 rounded bg-black/40 border border-white/10 text-hm-rust font-bold">
              kube-system
            </span>
            <span className="px-3 py-1 rounded bg-black/40 border border-white/10 text-hm-rust font-bold">
              kube-public
            </span>
            <span className="px-3 py-1 rounded bg-black/40 border border-white/10 text-hm-rust font-bold">
              healmesh
            </span>
          </div>
        </div>

        {/* Backend API Endpoint */}
        <div className="glass-card p-6 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Database size={18} className="text-hm-teal" /> Backend Core API Configuration
          </div>
          <div className="flex items-center justify-between bg-black/40 p-3 rounded-xl border border-white/10 text-xs font-mono text-white/80">
            <span>VITE_API_URL: http://localhost:8000</span>
            <span className="text-hm-emerald flex items-center gap-1 font-semibold">
              <Check size={14} /> Ready
            </span>
          </div>
        </div>

        {/* Audit Policy */}
        <div className="glass-card p-6 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold">
            <Sliders size={18} className="text-hm-amber" /> Audit Retention & Invariance
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            Audit logging enforces append-only triggers at the database layer (PostgreSQL).
            Updates and deletions are rejected by DB triggers.
          </p>
        </div>
      </div>
    </div>
  )
}
