import { motion } from 'framer-motion'
import { ArrowRight, Terminal, AlertTriangle, ShieldCheck, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function DemoSection() {
  return (
    <section id="demo" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
        <div className="label-style text-hm-amber">Interactive Showcase</div>
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
          See it working. Right now.
        </h2>
        <p className="text-white/60 text-base">
          Below is a live preview of the HealMesh incident console. Click into the dashboard
          to explore the 3D topology, remediation approval queue, and audit trails.
        </p>
      </div>

      {/* Browser Mockup Window */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="rounded-2xl border border-white/15 overflow-hidden shadow-2xl bg-[#0B1726]/90 backdrop-blur-xl max-w-5xl mx-auto"
      >
        {/* Browser Window Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="px-6 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-white/50 flex items-center gap-2">
            <span className="text-hm-emerald">🔒</span> https://healmesh.local/dashboard (demo cluster)
          </div>
          <Link
            to="/dashboard"
            className="text-xs text-hm-teal hover:text-white flex items-center gap-1 font-semibold"
          >
            Launch Full Screen <ArrowRight size={12} />
          </Link>
        </div>

        {/* Embedded Interactive Teaser */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4 rounded-xl">
              <div className="text-xs text-white/50 uppercase tracking-wider font-mono">Cluster Status</div>
              <div className="text-xl font-bold text-white mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-hm-emerald animate-pulse" />
                healmesh-test
              </div>
              <div className="text-xs text-white/40 mt-1">7 Active Namespaces</div>
            </div>

            <div className="glass-card p-4 rounded-xl border-l-2 border-hm-rust">
              <div className="text-xs text-white/50 uppercase tracking-wider font-mono">Active Incidents</div>
              <div className="text-xl font-bold text-hm-rust mt-1 flex items-center gap-2">
                <AlertTriangle size={18} />
                3 Unresolved
              </div>
              <div className="text-xs text-white/40 mt-1">1 CrashLoop · 1 OOM · 1 ImagePull</div>
            </div>

            <div className="glass-card p-4 rounded-xl">
              <div className="text-xs text-white/50 uppercase tracking-wider font-mono">Inference Engine</div>
              <div className="text-xl font-bold text-hm-teal mt-1 flex items-center gap-2">
                <Zap size={18} />
                Groq Llama 3.1
              </div>
              <div className="text-xs text-white/40 mt-1">Direct SDK (842ms latency)</div>
            </div>
          </div>

          {/* Sample Active Triage Case */}
          <div className="glass-card p-6 rounded-xl border border-hm-teal/30 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-hm-rust animate-pulse" />
                <span className="font-mono text-sm font-semibold text-white">payments-service-6f8d7f</span>
                <span className="badge-incident text-[11px]">CrashLoopBackOff</span>
              </div>
              <span className="text-xs font-mono text-hm-emerald bg-hm-emerald/10 border border-hm-emerald/30 px-2 py-0.5 rounded-full">
                ⬢ High Confidence (Groq 8B)
              </span>
            </div>

            <div className="text-sm text-white/80 leading-relaxed bg-black/30 p-4 rounded-lg border border-white/5 font-sans">
              <span className="text-hm-teal font-semibold">AI Root Cause: </span>
              The pod is crashing because it cannot connect to the PostgreSQL database on 10.0.15.23:5432 (ECONNREFUSED).
              The database endpoint is currently unreachable from this pod.
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs font-mono text-white/50">
                <Terminal size={14} className="text-hm-teal" />
                <span>kubectl -n payments logs payments-service-6f8d7f --tail=50</span>
              </div>
              <Link
                to="/dashboard"
                className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-4"
              >
                <span>Inspect in Live Dashboard</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="text-center text-xs text-white/40 mt-6 italic">
        ↑ Live interactive simulation with real closed-enum parser outputs & simulated cluster telemetry.
      </div>
    </section>
  )
}
