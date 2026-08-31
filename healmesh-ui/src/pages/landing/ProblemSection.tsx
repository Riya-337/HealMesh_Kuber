import { motion } from 'framer-motion'
import { CheckCircle2, ShieldAlert } from 'lucide-react'

export default function ProblemSection() {
  return (
    <section id="problem" className="py-32 px-6 max-w-7xl mx-auto border-t border-white/10 relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Left Column: Bold Editorial Manifesto */}
        <div className="lg:col-span-5 space-y-8 sticky top-28">
          <div className="space-y-4">
            <span className="label-style text-white/50 text-xs tracking-widest uppercase">
              The Reality of 3:00 AM Outages
            </span>

            <h2 className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl heading-3d leading-[1.08]">
              Your servers are like a city.{' '}
              <span className="block mt-2 subheading-3d">And cities break down.</span>
            </h2>
          </div>

          <p className="text-lg text-white/75 font-serif leading-relaxed">
            When a container crashes in the dead of night, teams waste hours sifting through
            thousands of lines of logs just to find the single database timeout that triggered it all.
          </p>

          <div className="p-6 rounded-2xl bg-white/[0.04] border-l-2 border-l-white/60 border-t border-r border-b border-white/10 backdrop-blur-xl space-y-2 shadow-2xl">
            <div className="text-xs font-mono text-white/70 font-bold uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert size={14} /> The Traditional Cost
            </div>
            <div className="text-sm font-serif text-white/90 leading-snug">
              Average Kubernetes MTTR is <strong>47 minutes</strong> — 80% of which is spent reading logs and arguing in war rooms.
            </div>
          </div>
        </div>

        {/* Right Column: Clean Architectural Outage Timeline Dossier */}
        <div className="lg:col-span-7 space-y-6">
          {/* Phase 01: The Midnight Collapse */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-white/[0.04] border-t border-l border-white/30 border-r border-b border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-3xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono px-3 py-1 rounded-md bg-white/10 text-white/90 border border-white/20 font-bold">
                  03:14:02 AM
                </span>
                <span className="text-sm font-serif font-bold text-white">The Midnight Collapse</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-white/60 animate-ping" />
            </div>

            <p className="text-sm text-white/75 font-serif leading-relaxed">
              A background pool exhaustion causes payments-service to exit. Kubernetes enters an immediate CrashLoopBackOff.
            </p>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-white/80 space-y-1">
              <div>[03:14:02] ERROR connect ECONNREFUSED 10.0.15.23:5432</div>
              <div className="text-white/50">[03:14:03] FATAL database pool unreachable — process exiting with code 1</div>
            </div>
          </motion.div>

          {/* Phase Waveform Connector */}
          <div className="flex items-center justify-center gap-3 text-xs font-mono text-white/40 py-1">
            <span className="h-6 w-[1px] bg-white/20" />
            <span className="px-3.5 py-1 rounded-full bg-white/5 border border-white/15 text-white/70 font-mono text-xs">
              ⚡ 842ms LLM Synthesis via Groq LPU
            </span>
            <span className="h-6 w-[1px] bg-white/20" />
          </div>

          {/* Phase 02: Groq Root-Cause Synthesis */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="p-8 rounded-3xl bg-white/[0.06] border-t border-l border-white/40 border-r border-b border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-3xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono px-3 py-1 rounded-md bg-white/15 text-white border border-white/25 font-bold">
                  03:14:03 AM
                </span>
                <span className="text-sm font-serif font-bold text-white">Instant Root-Cause Plain Diagnosis</span>
              </div>
              <span className="text-xs font-mono text-white/90 bg-white/10 px-3 py-0.5 rounded-full border border-white/20">
                ⬢ High Confidence
              </span>
            </div>

            <div className="p-4 rounded-xl bg-black/30 border border-white/10 text-sm font-serif text-white/95 leading-relaxed shadow-inner">
              "The pod is crashing because it cannot connect to PostgreSQL at 10.0.15.23:5432 (connection refused). No cluster mutation is needed — operator intervention required on the database endpoint."
            </div>
          </motion.div>

          {/* Phase Waveform Connector */}
          <div className="flex items-center justify-center gap-3 text-xs font-mono text-white/40 py-1">
            <span className="h-6 w-[1px] bg-white/20" />
            <span className="px-3.5 py-1 rounded-full bg-white/5 border border-white/15 text-white/70 font-mono text-xs">
              ✓ Guardrails Verified · Closed-Enum Action Dispatched
            </span>
            <span className="h-6 w-[1px] bg-white/20" />
          </div>

          {/* Phase 03: Human-Approved Resolution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-8 rounded-3xl bg-white/[0.04] border-t border-l border-white/30 border-r border-b border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-3xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono px-3 py-1 rounded-md bg-white/10 text-white/90 border border-white/20 font-bold">
                  03:14:48 AM
                </span>
                <span className="text-sm font-serif font-bold text-white">Safe Execution & Full Audit Record</span>
              </div>
              <CheckCircle2 size={18} className="text-white/80" />
            </div>

            <p className="text-sm text-white/75 font-serif leading-relaxed">
              Slack alert received with single-tap action. Invariant denylist checked. Append-only audit record committed to PostgreSQL.
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs font-mono text-white/60">
              <span>Status: <strong className="text-white font-bold">RESOLVED (46s MTTR)</strong></span>
              <span>Audit Hash: <strong className="text-white/80">0xa3f2b1c9</strong></span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
