import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowRight, Radio, BrainCircuit, ShieldCheck } from 'lucide-react'

const PIPELINE_STAGES = [
  {
    id: 'detect',
    step: '01',
    name: 'Real-Time K8s Watcher',
    badge: 'EVENT STREAM',
    subtitle: 'Zero-overhead Go client streaming pod transitions',
    headline: 'Continuous, sub-second failure detection directly from Kubernetes etcd.',
    details:
      'The watcher operates with strict read-only cluster role privileges. It monitors 5 core failure classes (CrashLoopBackOff, OOMKilled, ImagePullBackOff, FailedRollout, ResourceQuotaExceeded) and extracts sanitized container log tails the instant a failure occurs.',
    metric: '< 2.0s Time to Detect',
    color: '#06B6D4',
    icon: Radio,
    visual: (
      <div className="p-6 rounded-2xl bg-black/60 border border-hm-cyan/40 font-mono text-xs space-y-3 shadow-[0_15px_40px_rgba(6,182,212,0.15)]">
        <div className="flex items-center justify-between text-white/50 text-[11px] pb-2 border-b border-white/10">
          <span>EVENT: POD_FAILED_PHASE</span>
          <span className="text-rose-400 font-bold">● CRITICAL</span>
        </div>
        <div className="space-y-1 text-white/90 text-[11px]">
          <div><span className="text-white/40">namespace:</span> payments</div>
          <div><span className="text-white/40">pod_name:</span> payments-service-6f8d7f</div>
          <div><span className="text-white/40">reason:</span> CrashLoopBackOff (exit code 1)</div>
          <div><span className="text-white/40">log_tail:</span> "ERROR connect ECONNREFUSED 10.0.15.23:5432"</div>
        </div>
        <div className="pt-2 text-[10px] text-cyan-300 font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-hm-cyan animate-ping" />
          Dispatched payload to healmesh-core (POST /incident)
        </div>
      </div>
    ),
  },
  {
    id: 'diagnose',
    step: '02',
    name: 'Groq LPU AI Synthesis',
    badge: 'LLAMA 3.1 8B',
    subtitle: 'Direct SDK invocation with closed-enum safety parser',
    headline: 'Plain-language root cause synthesis in 842 milliseconds.',
    details:
      'Log excerpts and container states are evaluated against strict diagnostic schemas. Raw LLM output is fed directly through a closed-enum parser enforcing PATCH, REDEPLOY, SCALE, HELM_UPGRADE, or NONE. No unverified text can execute.',
    metric: '842ms Average Latency',
    color: '#6366F1',
    icon: BrainCircuit,
    visual: (
      <div className="p-6 rounded-2xl bg-black/60 border border-hm-indigo/40 font-mono text-xs space-y-3 shadow-[0_15px_40px_rgba(99,102,241,0.15)]">
        <div className="flex items-center justify-between text-white/50 text-[11px] pb-2 border-b border-white/10">
          <span className="text-indigo-300 font-bold">GROQ INFERENCE RESPONSE</span>
          <span className="text-emerald-300 font-bold">⬢ HIGH CONFIDENCE</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white/95 font-serif text-sm leading-relaxed shadow-inner">
          "The pod is crashing because it cannot connect to PostgreSQL at 10.0.15.23:5432. The database is refusing connections. Operator intervention required."
        </div>
        <div className="flex items-center justify-between text-[10px] text-white/60">
          <span>PARSED ACTION: <strong className="text-white font-mono">NONE</strong></span>
          <span className="text-emerald-300">✓ Parser Invariant Passed</span>
        </div>
      </div>
    ),
  },
  {
    id: 'heal',
    step: '03',
    name: 'Human-Approved Remediation',
    badge: 'SLACK & WEB APPROVAL',
    subtitle: 'Write path isolated in healmesh-executor',
    headline: 'One-click operator sign-off with hardcoded denylist guardrails.',
    details:
      'Remediation proposals are delivered to Slack or the web dashboard with an interactive diff. Upon operator sign-off, healmesh-executor applies the narrow mutation. Protected namespaces (kube-system, kube-public, healmesh) are permanently locked.',
    metric: '100% Operator Sign-Off',
    color: '#10B981',
    icon: ShieldCheck,
    visual: (
      <div className="p-6 rounded-2xl bg-black/60 border border-hm-mint/40 space-y-4 shadow-[0_15px_40px_rgba(16,185,129,0.15)]">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10 font-mono">
          <span className="text-white font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-hm-mint" />
            Remediation Approval Ready
          </span>
          <span className="text-emerald-300 text-[11px] font-bold">VERIFIED</span>
        </div>
        <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono space-y-1">
          <div className="text-white/40">GUARDRAIL CHECK:</div>
          <div className="text-emerald-300">✓ Namespace 'payments' allowed (not in denylist)</div>
          <div className="text-emerald-300">✓ Mutating Action: NONE (Zero unsafe mutation)</div>
        </div>
        <button className="btn-primary w-full py-2.5 text-xs font-serif flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
          <Check size={14} /> Authorize Remediation
        </button>
      </div>
    ),
  },
]

export default function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState(0)
  const current = PIPELINE_STAGES[activeTab]

  return (
    <section id="how-it-works" className="py-32 px-6 max-w-7xl mx-auto border-t border-white/10">
      {/* Editorial Header with 3D Embossed Heading */}
      <div className="max-w-3xl mb-16 space-y-4">
        <span className="label-style text-hm-cyan text-xs tracking-widest uppercase">
          Continuous Autonomous Pipeline
        </span>
        <h2 className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl heading-3d leading-tight">
          Three steps. <span className="block mt-1 subheading-3d">Seconds, not hours.</span>
        </h2>
        <p className="text-lg text-white/75 font-serif leading-relaxed">
          From silent background failure to confirmed self-healing in under two minutes —
          with zero unverified LLM actions touching your cluster.
        </p>
      </div>

      {/* Interactive Horizontal Pipeline Ribbon */}
      <div className="space-y-8">
        {/* Step Navigation Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-white/15 pb-4">
          {PIPELINE_STAGES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveTab(idx)}
              className={`text-left p-5 rounded-2xl transition-all duration-300 flex items-start gap-4 border ${
                activeTab === idx
                  ? 'bg-white/[0.14] border-white/40 shadow-xl'
                  : 'bg-transparent border-transparent hover:bg-white/[0.04] text-white/50'
              }`}
            >
              <span
                className="font-serif font-black text-3xl leading-none transition-colors"
                style={{ color: s.color }}
              >
                {s.step}
              </span>
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-white/50 mb-0.5">
                  {s.badge}
                </div>
                <div
                  className={`font-serif font-bold text-base transition-colors ${
                    activeTab === idx ? 'text-white' : 'text-white/70'
                  }`}
                >
                  {s.name}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Active Stage Detailed Showcase Deck */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
            className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-white/[0.12] to-white/[0.02] border-t border-l border-white/40 border-r border-b border-white/15 shadow-[0_25px_60px_rgba(4,8,20,0.5)] backdrop-blur-3xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Column: Stage Manifesto */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-mono text-white/90">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: current.color }} />
                  {current.subtitle}
                </div>

                <h3 className="font-serif font-bold text-3xl sm:text-4xl text-white leading-snug">
                  {current.headline}
                </h3>

                <p className="text-base text-white/75 font-serif leading-relaxed">
                  {current.details}
                </p>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="text-sm font-serif font-bold text-white flex items-center gap-2">
                    <span className="text-xs font-mono text-white/40 uppercase">Performance:</span>
                    <span style={{ color: current.color }} className="font-bold">{current.metric}</span>
                  </div>
                  <button
                    onClick={() => setActiveTab((activeTab + 1) % 3)}
                    className="text-xs font-serif text-hm-cyan hover:text-white flex items-center gap-1.5 font-bold"
                  >
                    <span>Next Stage</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>

              {/* Right Column: Live Telemetry Visual */}
              <div className="lg:col-span-6">{current.visual}</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
