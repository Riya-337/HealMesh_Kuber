import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Copy,
  CheckCircle,
  ChevronRight,
  Activity,
  Terminal,
  GripHorizontal,
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useIncidentStore } from '../../hooks/useIncidentStore'
import ConfidenceBadge from './ConfidenceBadge'
import LogSnippet from './LogSnippet'
import ActionPanel from './ActionPanel'
import PodHologramCanvas from '../three/PodHologramCanvas'
import { formatRelativeTime, getFailureColor } from '../../lib/utils'
import { useAuthStore } from '../../hooks/useAuthStore'
import { Lock } from 'lucide-react'

type ResizeDir = 'e' | 'w' | 's' | 'n' | 'se' | 'sw' | 'ne' | 'nw'

export default function IncidentDrawer() {
  const { selected, drawerOpen, closeDrawer } = useIncidentStore()
  const { currentUser } = useAuthStore()
  const [copied, setCopied] = useState(false)

  // Floating Window Coordinates & Size
  const [pos, setPos] = useState({ x: 0, y: 30 })
  const [size, setSize] = useState({ width: 480, height: 680 })

  // Initialize position to top-right on open
  useEffect(() => {
    if (drawerOpen) {
      const defaultX = Math.max(window.innerWidth - 510, 20)
      setPos({ x: defaultX, y: 30 })
      setSize({
        width: Math.min(480, window.innerWidth - 40),
        height: Math.min(680, window.innerHeight - 60),
      })
    }
  }, [drawerOpen])

  const dragAction = useRef<{
    type: 'move' | 'resize'
    dir?: ResizeDir
    startX: number
    startY: number
    initX: number
    initY: number
    initW: number
    initH: number
  } | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeDrawer])

  // Global Mouse Move & Mouse Up for Fluid Native Drag & Side Resizing
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragAction.current) return
      const { type, dir, startX, startY, initX, initY, initW, initH } = dragAction.current
      const deltaX = e.clientX - startX
      const deltaY = e.clientY - startY

      if (type === 'move') {
        const nextX = Math.max(10, Math.min(initX + deltaX, window.innerWidth - 80))
        const nextY = Math.max(10, Math.min(initY + deltaY, window.innerHeight - 80))
        setPos({ x: nextX, y: nextY })
      } else if (type === 'resize' && dir) {
        let newW = initW
        let newH = initH
        let newX = initX
        let newY = initY

        // Horizontal resizing
        if (dir.includes('e')) {
          newW = Math.max(340, Math.min(initW + deltaX, window.innerWidth - initX - 20))
        }
        if (dir.includes('w')) {
          const possibleW = initW - deltaX
          if (possibleW >= 340 && initX + deltaX >= 10) {
            newW = possibleW
            newX = initX + deltaX
          }
        }

        // Vertical resizing
        if (dir.includes('s')) {
          newH = Math.max(380, Math.min(initH + deltaY, window.innerHeight - initY - 20))
        }
        if (dir.includes('n')) {
          const possibleH = initH - deltaY
          if (possibleH >= 380 && initY + deltaY >= 10) {
            newH = possibleH
            newY = initY + deltaY
          }
        }

        setSize({ width: newW, height: newH })
        setPos({ x: newX, y: newY })
      }
    }

    const onMouseUp = () => {
      if (dragAction.current) {
        dragAction.current = null
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  // Start Move from Titlebar
  const startWindowDrag = (e: React.MouseEvent) => {
    e.preventDefault()
    dragAction.current = {
      type: 'move',
      startX: e.clientX,
      startY: e.clientY,
      initX: pos.x,
      initY: pos.y,
      initW: size.width,
      initH: size.height,
    }
    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
  }

  // Start Side / Corner Resize
  const startResize = (dir: ResizeDir, cursor: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragAction.current = {
      type: 'resize',
      dir,
      startX: e.clientX,
      startY: e.clientY,
      initX: pos.x,
      initY: pos.y,
      initW: size.width,
      initH: size.height,
    }
    document.body.style.cursor = cursor
    document.body.style.userSelect = 'none'
  }

  const handleCopy = () => {
    if (selected?.suggested_manual_command) {
      navigator.clipboard.writeText(selected.suggested_manual_command)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <AnimatePresence>
      {drawerOpen && selected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            left: `${pos.x}px`,
            top: `${pos.y}px`,
            width: `${size.width}px`,
            height: `${size.height}px`,
            zIndex: 60,
            background: 'linear-gradient(145deg, rgba(14,22,46,0.97) 0%, rgba(8,14,30,0.99) 100%)',
            backdropFilter: 'blur(40px)',
          }}
          className="flex flex-col rounded-3xl overflow-hidden glass-card border-t border-l border-white/40 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(56,189,248,0.15)]"
        >
          {/* ================= RESIZE HIT ZONES ON ALL 4 SIDES & 4 CORNERS ================= */}
          {/* Top Edge */}
          <div
            onMouseDown={startResize('n', 'n-resize')}
            className="absolute top-0 left-3 right-3 h-2 cursor-n-resize z-50 hover:bg-cyan-400/30 transition-colors"
          />
          {/* Bottom Edge */}
          <div
            onMouseDown={startResize('s', 's-resize')}
            className="absolute bottom-0 left-3 right-3 h-2 cursor-s-resize z-50 hover:bg-cyan-400/30 transition-colors"
          />
          {/* Left Edge */}
          <div
            onMouseDown={startResize('w', 'w-resize')}
            className="absolute top-3 bottom-3 left-0 w-2 cursor-w-resize z-50 hover:bg-cyan-400/30 transition-colors"
          />
          {/* Right Edge */}
          <div
            onMouseDown={startResize('e', 'e-resize')}
            className="absolute top-3 bottom-3 right-0 w-2 cursor-e-resize z-50 hover:bg-cyan-400/30 transition-colors"
          />
          {/* Top-Left Corner */}
          <div
            onMouseDown={startResize('nw', 'nw-resize')}
            className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-50"
          />
          {/* Top-Right Corner */}
          <div
            onMouseDown={startResize('ne', 'ne-resize')}
            className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-50"
          />
          {/* Bottom-Left Corner */}
          <div
            onMouseDown={startResize('sw', 'sw-resize')}
            className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-50"
          />
          {/* Bottom-Right Corner */}
          <div
            onMouseDown={startResize('se', 'se-resize')}
            className="absolute bottom-0 right-0 w-5 h-5 cursor-se-resize z-50 flex items-center justify-center text-white/30 hover:text-cyan-300"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M9 1L1 9M9 5L5 9M9 9L9 9.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Cyber HUD Corner Brackets */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-hm-cyan/60 pointer-events-none" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-hm-cyan/60 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-hm-cyan/60 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-hm-cyan/60 pointer-events-none" />

          {/* Draggable Titlebar Header */}
          <div
            onMouseDown={startWindowDrag}
            className="p-4 border-b border-white/15 flex items-center justify-between bg-black/30 flex-shrink-0 cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex items-center gap-2.5">
              <GripHorizontal size={16} className="text-white/40" />
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: getFailureColor(selected.failure_type),
                  boxShadow: `0 0 12px ${getFailureColor(selected.failure_type)}`,
                }}
              />
              <div>
                <div className="font-mono text-xs font-bold text-white tracking-wide truncate max-w-[260px]">
                  {selected.pod_name}
                </div>
                <div className="text-[10px] text-white/50 font-serif">
                  {selected.failure_type} · Detected {formatRelativeTime(selected.created_at)}
                </div>
              </div>
            </div>

            {/* Clean Close Button */}
            <button
              onClick={closeDrawer}
              className="p-1.5 rounded-lg bg-rose-500/20 border border-rose-400/40 hover:bg-rose-500/40 text-rose-200 transition-all cursor-pointer"
              title="Close window"
            >
              <X size={14} />
            </button>
          </div>

          {/* Scrollable Spatial Inspector Workspace */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* 3D Hologram Pod Scanner */}
            <PodHologramCanvas failureType={selected.failure_type} />

            {/* Node & Namespace Metadata Grid */}
            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-black/40 border border-white/10 text-xs font-serif">
              <div>
                <div className="label-style text-[9px] mb-0.5">Namespace</div>
                <div className="text-white font-bold">{selected.namespace}</div>
              </div>
              <div>
                <div className="label-style text-[9px] mb-0.5">Cluster Node</div>
                <div className="text-white font-bold">demo-node-e</div>
              </div>
              <div>
                <div className="label-style text-[9px] mb-0.5">Health State</div>
                <div className="text-rose-400 font-bold">Critical</div>
              </div>
            </div>

            {/* AI Root Cause with Luminous Border */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="label-style text-xs">AI Root Cause Diagnosis</span>
                  <span className="text-[10px] text-cyan-300 font-mono">(Groq · Llama 3.1)</span>
                </div>
                <ConfidenceBadge level={selected.confidence} />
              </div>

              <div className="p-4 rounded-2xl bg-cyan-500/[0.06] border border-cyan-400/30 text-white/90 text-sm leading-relaxed font-serif shadow-inner">
                {selected.root_cause}
              </div>
            </div>

            {/* Suggested Manual Command */}
            {selected.suggested_manual_command && (
              <div className="space-y-2">
                <div className="label-style text-xs flex items-center gap-1.5">
                  <Terminal size={12} className="text-cyan-400" /> Suggested Remediation Command
                </div>
                <div className="relative group">
                  <pre className="font-mono text-xs p-3.5 rounded-2xl bg-black/60 border border-white/10 text-emerald-300 overflow-x-auto">
                    {selected.suggested_manual_command}
                  </pre>
                  <button
                    onClick={handleCopy}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all shadow-md cursor-pointer"
                  >
                    {copied ? <CheckCircle size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            )}

            {/* Log Snippet */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="label-style text-xs">Live Log Snippet (Last 50 lines)</span>
                <span className="text-[10px] text-cyan-400 font-serif flex items-center gap-0.5">
                  client-go <ChevronRight size={10} />
                </span>
              </div>
              <LogSnippet lines={selected.log_snippet} />
            </div>

            {/* Proposed Action */}
            <div className="pt-2 border-t border-white/10">
              <ActionPanel action={selected.parsed_action} namespace={selected.namespace} />
            </div>
          </div>

          {/* Authorize Slider Footer */}
          <div className="p-4 border-t border-white/15 bg-black/40 flex-shrink-0">
            {selected.parsed_action.action_type === 'NONE' ? (
              <div className="space-y-1.5">
                <button
                  disabled
                  className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-serif font-bold text-white/30 cursor-not-allowed"
                >
                  Slide to Authorize (Disabled)
                </button>
                <p className="text-center text-[10px] text-white/40 font-serif">
                  No mutation required — external dependency failure
                </p>
              </div>
            ) : currentUser?.role !== 'ADMIN' ? (
              <div className="space-y-2">
                <button
                  disabled
                  className="w-full py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs font-serif font-bold text-amber-300/60 cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Lock size={14} className="text-amber-400" /> Only Admin (Riya Aggarwal) Can Authorize Fixes
                </button>
                <p className="text-center text-[10px] text-white/40 font-serif">
                  Your current account ({currentUser?.name || 'Viewer'}) does not possess cluster-level write permissions.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    alert(`✅ [HEALMESH EXECUTOR] Remediation action "${selected.parsed_action.action_type}" authorized by Admin (Riya Aggarwal). Sent to Go Executor write-path.`)
                    closeDrawer()
                  }}
                  className="btn-primary w-full py-3 text-xs font-serif flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(99,102,241,0.4)] cursor-pointer"
                >
                  <CheckCircle size={14} /> Authorize & Apply {selected.parsed_action.action_type} Fix
                </button>
                <button
                  onClick={closeDrawer}
                  className="w-full text-center text-xs text-rose-400 hover:text-white transition-colors font-serif cursor-pointer"
                >
                  Reject Remediation Proposal
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
