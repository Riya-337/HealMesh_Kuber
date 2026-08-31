import { MessageSquare, Zap, Shield, Check } from 'lucide-react'

export default function IntegrationsPage() {
  return (
    <div className="p-4 md:p-6 max-w-[1300px] mx-auto w-full space-y-6 overflow-y-auto h-full">
      <div>
        <div className="label-style text-hm-teal">External Interfaces & AI Providers</div>
        <h1 className="text-2xl font-bold font-display text-white mt-0.5">INTEGRATIONS</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Slack */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4A154B]/30 text-[#ECB22E] flex items-center justify-center">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">Slack Notifications</h3>
                  <span className="text-xs font-mono text-hm-emerald">● CONNECTED</span>
                </div>
              </div>
              <span className="badge-none text-[10px]">WEBHOOK</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed mb-4">
              Instant incident alerts, AI diagnoses, and approval buttons delivered directly
              to your designated SRE alert channel.
            </p>
          </div>
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-white/40 font-mono">Channel: #healmesh-alerts</span>
            <span className="text-hm-emerald font-semibold flex items-center gap-1">
              <Check size={14} /> Active
            </span>
          </div>
        </div>

        {/* Groq */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-hm-teal/20 text-hm-teal flex items-center justify-center">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">Groq AI Inference</h3>
                  <span className="text-xs font-mono text-hm-teal">● DIRECT SDK</span>
                </div>
              </div>
              <span className="badge-demo text-[10px]">LLM</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed mb-4">
              High-throughput LPU inference running <code className="text-white font-mono">llama-3.1-8b-instant</code> with
              strict closed-enum JSON schema enforcement.
            </p>
          </div>
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-white/40 font-mono">Avg Response: 842ms</span>
            <span className="text-hm-teal font-semibold flex items-center gap-1">
              <Check size={14} /> Ultra-Fast
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
