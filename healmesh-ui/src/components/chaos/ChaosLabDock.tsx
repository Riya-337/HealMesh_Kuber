import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, X } from 'lucide-react'
import { useIncidentStore } from '../../hooks/useIncidentStore'
import { MOCK_DIAGNOSES } from '../../lib/mockData'
import type { FailureType } from '../../lib/types'

const CHAOS_ACTIONS: { label: string; icon: string; type: FailureType; namespace: string }[] = [
  { label: 'CrashLoop',  icon: '🔥', type: 'CrashLoopBackOff', namespace: 'batch-jobs' },
  { label: 'OOMKill',    icon: '💥', type: 'OOMKilled',         namespace: 'payments' },
  { label: 'Bad Image',  icon: '🚫', type: 'ImagePullBackOff',  namespace: 'default' },
  { label: 'Readiness',  icon: '⏳', type: 'FailedRollout',     namespace: 'monitoring' },
]

import { api } from '../../lib/api'

export default function ChaosLabDock() {
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const { addSimulated } = useIncidentStore()

  const inject = async (action: typeof CHAOS_ACTIONS[0]) => {
    const podSuffix = Math.random().toString(36).slice(2, 7)
    const podName = `${action.namespace}-svc-${podSuffix}`
    const incId = `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`

    const logLinesMap: Record<string, string[]> = {
      CrashLoopBackOff: ['Error: panic: runtime error: invalid memory address or nil pointer dereference', 'goroutine 1 [running]: main.main()', 'Back-off 2m20s restarting failed container'],
      OOMKilled: ['java.lang.OutOfMemoryError: Java heap space', 'Memory limit of 512Mi exceeded', 'Command terminated with exit code 137'],
      ImagePullBackOff: ['Failed to pull image "registry.internal/v2/app:latest": 404 Not Found', 'Error: ErrImagePull', 'Back-off pulling image'],
      FailedRollout: ['Deployment rollout is not making progress', 'Readiness probe failed: HTTP probe failed with statuscode: 500', 'DeadlineExceeded: progressDeadlineSeconds exceeded'],
    }

    const payload = {
      incident_id: incId,
      pod_name: podName,
      namespace: action.namespace,
      failure_type: action.type,
      detected_at: new Date().toISOString(),
      log_lines: logLinesMap[action.type] || ['Container error occurred'],
    }

    // 1. Instantly update UI Cockpit
    const base = MOCK_DIAGNOSES[0]
    addSimulated({
      ...base,
      id: `sim-${Date.now()}`,
      incident_id: incId,
      created_at: new Date().toISOString(),
      failure_type: action.type,
      namespace: action.namespace,
      pod_name: podName,
    })

    setOpen(false)
    setToast(`[CHAOS LAB] Injected ${action.type} into ${action.namespace}!`)

    // 2. Dispatch to Backend Core & Slack
    try {
      await api.post('/incident', payload)
      setToast(`⚡ ${action.type} dispatched to Core AI & Slack channel!`)
    } catch (e) {
      console.log('Dispatched simulated chaos event')
    }

    setTimeout(() => setToast(null), 3500)
  }

  return (
    <>
      {/* Floating trigger */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="glass-card p-3 w-72"
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className="text-[10px] text-hm-amber px-2 py-1 rounded w-full mr-2"
                  style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.20)' }}
                >
                  ⚡ Simulation Mode — no real cluster mutations
                </div>
                <button onClick={() => setOpen(false)} className="text-white/30 hover:text-white/60 flex-shrink-0">
                  <X size={14} />
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {CHAOS_ACTIONS.map(a => (
                  <button
                    key={a.type}
                    onClick={() => inject(a)}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg text-center transition-all hover:bg-white/10"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <span className="text-xl">{a.icon}</span>
                    <span className="text-[9px] text-white/60 leading-tight">{a.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all"
          style={{
            background: 'linear-gradient(135deg,#0A1628,#1A2A3A)',
            border: '1px solid rgba(255,255,255,0.14)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.50)',
          }}
        >
          <Zap size={13} className="text-hm-amber" />
          <span className="text-white/80">Chaos Lab</span>
          <span className="w-1.5 h-1.5 rounded-full bg-hm-rust animate-pulse-slow" />
        </button>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="fixed bottom-5 left-5 z-50 glass-card px-4 py-2.5 text-xs text-hm-amber flex items-center gap-2"
          >
            <Zap size={11} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
