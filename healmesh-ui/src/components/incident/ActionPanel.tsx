import { Lock } from 'lucide-react'
import type { ParsedAction } from '../../lib/types'
import { PROTECTED_NAMESPACES } from '../../lib/utils'

const ACTION_COLORS: Record<string, string> = {
  PATCH: '#10B981', REDEPLOY: '#10B981', SCALE: '#10B981', HELM_UPGRADE: '#10B981', NONE: '#94A3B8',
}

export default function ActionPanel({ action, namespace }: { action?: ParsedAction | null; namespace: string }) {
  const safeAction = action || { action_type: 'NONE', params: null }
  const color = ACTION_COLORS[safeAction.action_type] || '#94A3B8'
  const isProtected = PROTECTED_NAMESPACES.has(namespace)

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="label-style">AI Proposed Action</span>
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded"
          style={{ color, background: `${color}18`, border: `1px solid ${color}30` }}
        >
          {safeAction.action_type}
        </span>
      </div>

      {safeAction.action_type === 'NONE' && (
        <div className="space-y-2">
          <p className="text-xs text-white/60 leading-relaxed font-serif">
            External dependency or application exception detected.<br />
            No safe automated mutation — operator review recommended.
          </p>
          <div
            className="flex items-center gap-2 p-2.5 rounded-lg text-xs text-white/40 font-serif"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <Lock size={12} className="flex-shrink-0" />
            No executor mutation required — closed enum safely routed to NONE
          </div>
        </div>
      )}

      {isProtected && safeAction.action_type !== 'NONE' && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg text-xs text-hm-rust font-serif"
          style={{ background: 'rgba(193,123,58,0.08)', border: '1px solid rgba(193,123,58,0.20)' }}>
          <Lock size={12} />
          Protected namespace ({namespace}) — cluster mutation blocked by security invariant
        </div>
      )}

      {safeAction.action_type !== 'NONE' && !isProtected && safeAction.params && (
        <div
          className="p-3 rounded-lg font-mono text-xs space-y-1"
          style={{ background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {Object.entries(safeAction.params).map(([k, v]) => (
            <div key={k} className="text-white/60">
              {k}: <span className="text-hm-rust line-through mr-2">old</span>
              <span className="text-hm-emerald">→ {String(v)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
