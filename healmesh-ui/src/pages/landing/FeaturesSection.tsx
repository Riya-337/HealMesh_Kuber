import { CheckCircle2, Shield, Lock, ScrollText, Zap } from 'lucide-react'

export default function FeaturesSection() {
  const specs = [
    {
      num: '01',
      title: 'Closed-Enum Action Parser',
      subtitle: 'Strict Type-Safety & Safety Invariants',
      description:
        'Raw LLM text NEVER reaches a shell, kubectl, or client API directly. Output is strictly constrained to a closed enum: PATCH, REDEPLOY, SCALE, HELM_UPGRADE, or NONE. Any unparseable string automatically collapses to NONE with zero mutation.',
      invariant: 'AGENTS.md Invariant 1',
      badge: 'Zero Prompt Injection',
      color: '#06B6D4',
      icon: Shield,
    },
    {
      num: '02',
      title: 'Hardcoded Namespace Denylists',
      subtitle: 'Cluster Critical Protection',
      description:
        'kube-system, kube-public, and healmesh namespaces are hardcoded denylists enforced directly in compiled Go and Python executor code paths. No prompt injection or operator override can mutate core cluster infrastructure.',
      invariant: 'CONSTITUTION.md Article 2.4',
      badge: 'Hardcoded in Code',
      color: '#F43F5E',
      icon: Lock,
    },
    {
      num: '03',
      title: 'Append-Only Database Triggers',
      description:
        'Audit logs in PostgreSQL are guarded by DB-level deny_mutation() triggers that permanently reject all UPDATE and DELETE queries. Every detection, diagnosis, and executor action is cryptographically preserved forever.',
      invariant: 'TDD §3.4 Database Triggers',
      badge: 'Immutable Records',
      color: '#10B981',
      icon: ScrollText,
    },
    {
      num: '04',
      title: 'Direct SDK · Zero Orchestration Middleware',
      description:
        'Direct SDK integration with Groq llama-3.1-8b-instant. We deliberately ban LangChain, LlamaIndex, n8n, and fragile multi-agent frameworks to ensure sub-second latency and zero unpredicted tool loops.',
      invariant: 'DECISION_LOG ADR-002',
      badge: '842ms Avg Latency',
      color: '#6366F1',
      icon: Zap,
    },
  ]

  return (
    <section id="features" className="py-32 px-6 max-w-7xl mx-auto border-t border-white/10">
      {/* Editorial Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end mb-16">
        <div className="lg:col-span-8 space-y-4">
          <span className="label-style text-hm-cyan text-xs tracking-widest uppercase">
            Architectural Guarantees & Safety Invariants
          </span>
          <h2 className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl heading-3d leading-tight">
            Zero Hallucinations.{' '}
            <span className="block mt-1 subheading-3d">Absolute Guarantees.</span>
          </h2>
        </div>
        <div className="lg:col-span-4 text-base text-white/75 font-serif leading-relaxed">
          HealMesh is engineered on non-negotiable safety principles. If the LLM generates an
          unparseable response, the system safely falls back to <strong className="text-white font-mono">NONE</strong> with zero cluster mutation.
        </div>
      </div>

      {/* Editorial Invariant Spec Stream */}
      <div className="divide-y divide-white/15 border-t border-b border-white/15">
        {specs.map((item) => (
          <div
            key={item.num}
            className="py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start hover:bg-white/[0.04] transition-colors px-4 rounded-2xl group"
          >
            {/* Column 1: Number & Badges */}
            <div className="lg:col-span-3 space-y-2">
              <div className="flex items-center gap-3">
                <span
                  className="font-serif font-black text-3xl transition-colors"
                  style={{ color: item.color }}
                >
                  {item.num}
                </span>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90">
                  {item.badge}
                </span>
              </div>
              <div className="text-[11px] font-mono text-white/50 tracking-wider">
                {item.invariant}
              </div>
            </div>

            {/* Column 2: Invariant Spec & Description */}
            <div className="lg:col-span-7 space-y-2">
              <h3 className="font-serif font-bold text-2xl text-white group-hover:text-hm-cyan transition-colors flex items-center gap-2">
                {item.title}
              </h3>
              <p className="text-base text-white/80 font-serif leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Column 3: Live Status */}
            <div className="lg:col-span-2 flex items-center lg:justify-end text-xs font-serif text-emerald-300 font-bold gap-1.5 pt-2">
              <CheckCircle2 size={16} className="text-hm-mint" />
              <span>Enforced in Code</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
