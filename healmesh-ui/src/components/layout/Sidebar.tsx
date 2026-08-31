import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  AlertTriangle,
  Wrench,
  FileText,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const NAV = [
  { path: '/dashboard',   label: 'Overview',            icon: LayoutDashboard },
  { path: '/dashboard/incidents',   label: 'Incidents / AI Diag', icon: AlertTriangle,   badge: 3 },
  { path: '/dashboard/remediation', label: 'Remediation',         icon: Wrench },
  { path: '/dashboard/audit-logs',  label: 'Audit Logs',          icon: FileText },
  { path: '/dashboard/chaos-lab',   label: 'Chaos Lab',           icon: Zap },
]

const PIPELINE = [
  { label: 'Watcher → Core', sub: 'HTTP POST /incident' },
  { label: 'Core → Groq',    sub: 'llama-3.1-8b-instant' },
  { label: 'Core → Slack',   sub: 'Diagnosis delivery' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.div
      animate={{ width: collapsed ? 68 : 250 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="flex-shrink-0 flex flex-col h-full overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(20, 32, 54, 0.95) 0%, rgba(14, 22, 40, 0.98) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.18)',
        backdropFilter: 'blur(28px)',
      }}
    >
      {/* Nav items */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1 px-3 mt-1">
        {NAV.map((item) => (
          <SideItem key={item.path} item={item} collapsed={collapsed} />
        ))}
      </div>

      {/* Pipeline Status */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mb-3 p-3.5 rounded-2xl border border-white/15 shadow-inner"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <div className="label-style mb-2 text-hm-cyan">Pipeline Status</div>
            {PIPELINE.map((p, i) => (
              <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
                <span className="text-hm-cyan font-mono text-xs mt-0.5 flex-shrink-0">
                  {['①', '②', '③'][i]}
                </span>
                <div className="min-w-0">
                  <div className="text-xs text-white/90 font-serif leading-tight">{p.label}</div>
                  <div className="text-[10px] text-white/50 font-mono mt-0.5">{p.sub}</div>
                </div>
                <span className="pipeline-dot-active ml-auto mt-1 flex-shrink-0" />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Footer */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-t border-white/10 bg-black/20">
        <div className="w-8 h-8 rounded-full bg-hm-cyan/25 border border-hm-cyan/50 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(56,189,248,0.3)]">
          <span className="text-hm-cyan text-xs font-bold font-serif">SA</span>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-w-0 flex-1"
            >
              <div className="text-xs text-white font-bold font-serif leading-none">SRE Operator</div>
              <div className="text-[10px] text-white/50 font-mono leading-none mt-1 truncate">
                admin@healmesh.io
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>
    </motion.div>
  )
}

function SideItem({ item, collapsed }: { item: typeof NAV[0]; collapsed: boolean }) {
  return (
    <Link
      to={item.path}
      title={collapsed ? item.label : undefined}
      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 relative"
      activeProps={{ className: 'sidebar-active' }}
      inactiveProps={{ className: 'sidebar-inactive hover:bg-white/[0.08] hover:text-white' }}
    >
      {({ isActive }) => (
        <>
          <item.icon size={17} className={`flex-shrink-0 ${isActive ? 'text-hm-cyan' : 'text-white/70'}`} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden text-xs font-serif font-medium"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
          {!collapsed && 'badge' in item && item.badge && (
            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-hm-rose/20 text-rose-300 border border-hm-rose/40">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  )
}
