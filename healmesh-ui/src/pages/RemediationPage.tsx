import { useState } from 'react'
import { Check, X, ShieldAlert, ShieldCheck, Lock, ArrowRight } from 'lucide-react'
import { useDiagnoses } from '../hooks/useDiagnoses'
import { PROTECTED_NAMESPACES } from '../lib/utils'
import type { ActionType } from '../lib/types'

export default function RemediationPage() {
  const { diagnoses } = useDiagnoses()
  const [approvedIds, setApprovedIds] = useState<string[]>([])
  const [rejectedIds, setRejectedIds] = useState<string[]>([])

  const handleApprove = (id: string) => {
    setApprovedIds((prev) => [...prev, id])
  }

  const handleReject = (id: string) => {
    setRejectedIds((prev) => [...prev, id])
  }

  return (
    <div className="p-4 md:p-6 max-w-[1500px] mx-auto w-full space-y-6 overflow-y-auto h-full">
      {/* Header */}
      <div>
        <div className="label-style text-hm-emerald">Human-in-the-Loop Safe Execution Queue</div>
        <h1 className="text-2xl font-bold font-display text-white mt-0.5">REMEDIATION QUEUE</h1>
        <p className="text-sm text-white/60 mt-1 max-w-2xl">
          All remediation actions require explicit operator sign-off before being dispatched
          to the write-only executor service. System namespaces are strictly locked in code.
        </p>
      </div>

      {/* Actionable Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {diagnoses.map((diag) => {
          const isApproved = approvedIds.includes(diag.id)
          const isRejected = rejectedIds.includes(diag.id)
          const isProtected = PROTECTED_NAMESPACES.has(diag.namespace)
          const isNone = diag.parsed_action.action_type === 'NONE'

          return (
            <div
              key={diag.id}
              className={`glass-card p-6 rounded-2xl flex flex-col justify-between border-t-2 ${
                isApproved
                  ? 'border-t-hm-emerald bg-hm-emerald/[0.02]'
                  : isRejected
                  ? 'border-t-hm-crimson bg-hm-crimson/[0.02]'
                  : 'border-t-hm-teal'
              }`}
            >
              <div className="space-y-4">
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-mono text-sm font-bold text-white">{diag.pod_name}</div>
                    <div className="text-xs text-white/40 font-mono mt-0.5">
                      Namespace: <span className="text-white/80 font-semibold">{diag.namespace}</span>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md ${
                      isNone ? 'badge-none' : 'bg-hm-teal/15 text-hm-teal border border-hm-teal/30'
                    }`}
                  >
                    ACTION: {diag.parsed_action.action_type}
                  </span>
                </div>

                {/* Diff box */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono space-y-1.5">
                  <div className="text-white/40 text-[10px] uppercase tracking-wider">Proposed Mutation:</div>
                  {isNone ? (
                    <div className="text-white/60">
                      NONE — External dependency failure requires manual intervention.
                    </div>
                  ) : diag.parsed_action.params ? (
                    Object.entries(diag.parsed_action.params).map(([k, v]) => (
                      <div key={k} className="text-white/80">
                        {k}: <span className="text-hm-rust line-through mr-1">current</span>{' '}
                        <span className="text-hm-emerald font-bold">→ {String(v)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-hm-emerald">Trigger rollout restart on deployment</div>
                  )}
                </div>

                {/* Guardrail Check */}
                <div className="flex items-center gap-2 text-xs">
                  {isProtected ? (
                    <span className="text-hm-rust flex items-center gap-1.5 font-medium">
                      <Lock size={14} /> Denylist: {diag.namespace} cannot be mutated
                    </span>
                  ) : (
                    <span className="text-hm-emerald flex items-center gap-1.5 font-medium">
                      <ShieldCheck size={14} /> Guardrails passed: Namespace allowed
                    </span>
                  )}
                </div>
              </div>

              {/* Action Controls */}
              <div className="pt-6 border-t border-white/10 mt-6">
                {isApproved ? (
                  <div className="flex items-center justify-center gap-2 text-xs text-hm-emerald font-semibold bg-hm-emerald/10 py-2.5 rounded-xl border border-hm-emerald/30">
                    <Check size={16} /> Remediation Approved & Executed
                  </div>
                ) : isRejected ? (
                  <div className="flex items-center justify-center gap-2 text-xs text-hm-crimson font-semibold bg-hm-crimson/10 py-2.5 rounded-xl border border-hm-crimson/30">
                    <X size={16} /> Remediation Rejected by Operator
                  </div>
                ) : isNone || isProtected ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/30 text-xs font-semibold cursor-not-allowed"
                  >
                    Action Locked (No Mutation Permitted)
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(diag.id)}
                      className="btn-primary flex-1 text-xs py-2.5 flex items-center justify-center gap-1.5"
                    >
                      <Check size={14} /> Slide to Authorize
                    </button>
                    <button
                      onClick={() => handleReject(diag.id)}
                      className="px-4 py-2.5 rounded-full border border-white/20 text-white/70 hover:bg-white/10 text-xs font-semibold transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
