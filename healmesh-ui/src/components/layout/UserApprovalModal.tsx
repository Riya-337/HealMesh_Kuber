import { motion, AnimatePresence } from 'framer-motion'
import { X, ShieldCheck, UserCheck, UserX, Clock, ShieldAlert } from 'lucide-react'
import { useAuthStore, type User } from '../../hooks/useAuthStore'

export default function UserApprovalModal() {
  const { users, currentUser, isAccessModalOpen, setIsAccessModalOpen, approveUser, rejectUser, switchUser, simulateIncomingRequest } = useAuthStore()

  if (!isAccessModalOpen) return null

  const pendingUsers = users.filter((u) => u.status === 'PENDING')
  const activeUsers = users.filter((u) => u.status === 'ACTIVE')
  const isAdmin = currentUser?.role === 'ADMIN'

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl rounded-3xl overflow-hidden glass-card border-t border-l border-white/40 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(56,189,248,0.15)] flex flex-col max-h-[85vh]"
          style={{
            background: 'linear-gradient(145deg, rgba(14,22,46,0.98) 0%, rgba(8,14,30,0.99) 100%)',
          }}
        >
          {/* Header */}
          <div className="p-5 border-b border-white/15 flex items-center justify-between bg-black/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-hm-cyan/20 border border-hm-cyan/40 flex items-center justify-center text-hm-cyan">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-white">Access Control & Sign-Up Approvals</h3>
                <p className="text-xs text-white/50 font-serif">
                  Governed by Admin: <span className="text-hm-cyan font-semibold">Riya Aggarwal</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAccessModalOpen(false)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Admin Warning Banner if viewed by non-admin */}
            {!isAdmin && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <ShieldAlert size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200/90 font-serif">
                  <strong>Read-Only View:</strong> You are currently logged in as a non-admin. Only <strong>Riya Aggarwal</strong> can approve or reject sign-up requests.
                </div>
              </div>
            )}

            {/* Quick Switch for Testing Demo */}
            <div className="p-4 rounded-2xl bg-black/30 border border-white/10">
              <div className="text-xs font-serif font-bold text-white mb-2 flex items-center justify-between">
                <span>🎭 Quick Switch User (For Presentation/Testing)</span>
                <span className="text-[10px] text-hm-cyan font-mono">Current: {currentUser?.name} ({currentUser?.role})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => switchUser(u)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-serif transition-all ${
                      currentUser?.id === u.id
                        ? 'bg-hm-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                        : 'bg-white/5 hover:bg-white/15 text-white/80 border border-white/10'
                    }`}
                  >
                    {u.name} ({u.role})
                  </button>
                ))}
              </div>
            </div>

            {/* Section 1: Pending Sign-up Approvals */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-amber-400" />
                  <h4 className="font-serif font-bold text-sm text-white">Pending Sign-Up Requests</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {pendingUsers.length} Pending
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => simulateIncomingRequest()}
                  className="text-xs font-serif text-hm-cyan hover:text-white px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>+ Test Incoming Sign-Up</span>
                </button>
              </div>

              {pendingUsers.length === 0 ? (
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-3">
                  <div className="text-xs text-white/50 font-serif">
                    No new sign-up requests currently awaiting review.
                  </div>
                  <button
                    type="button"
                    onClick={() => simulateIncomingRequest()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-hm-cyan/20 border border-hm-cyan/40 text-hm-cyan hover:bg-hm-cyan hover:text-slate-950 text-xs font-serif font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.2)]"
                  >
                    <span>⚡ Click to generate a test applicant</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pendingUsers.map((user) => (
                    <PendingUserCard
                      key={user.id}
                      user={user}
                      isAdmin={isAdmin}
                      onApprove={() => approveUser(user.id)}
                      onReject={() => rejectUser(user.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Active / Registered Users */}
            <div>
              <h4 className="font-serif font-bold text-sm text-white mb-3 flex items-center gap-2">
                <UserCheck size={16} className="text-hm-emerald" />
                <span>Authorized Directory</span>
              </h4>
              <div className="space-y-2">
                {activeUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-3.5 rounded-2xl bg-black/20 border border-white/10 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-serif font-bold text-white flex items-center gap-2">
                        {user.name}
                        {user.role === 'ADMIN' && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-hm-cyan/20 text-cyan-300 border border-hm-cyan/40">
                            Primary Admin
                          </span>
                        )}
                        {user.status === 'REJECTED' && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            Rejected
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-white/50 mt-0.5">{user.email}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-white/40 block">Role: {user.role}</span>
                      <span className="text-[10px] text-emerald-400 font-serif">
                        {user.status === 'ACTIVE' ? '● Verified & Active' : '● Restricted'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

function PendingUserCard({
  user,
  isAdmin,
  onApprove,
  onReject,
}: {
  user: User
  isAdmin: boolean
  onApprove: () => void
  onReject: () => void
}) {
  return (
    <div className="p-4 rounded-2xl bg-amber-500/[0.04] border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
      <div>
        <div className="text-xs font-serif font-bold text-white flex items-center gap-2">
          {user.name}
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Awaiting Riya's Approval
          </span>
        </div>
        <div className="text-[11px] font-mono text-white/60 mt-0.5">{user.email}</div>
        <div className="text-[10px] text-white/40 font-serif mt-1">Requested: {user.createdAt}</div>
      </div>

      <div className="flex items-center gap-2">
        <button
          disabled={!isAdmin}
          onClick={onApprove}
          className="px-3.5 py-2 rounded-xl bg-hm-emerald/20 border border-hm-emerald/40 text-emerald-300 hover:bg-hm-emerald hover:text-slate-950 text-xs font-serif font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <UserCheck size={14} />
          <span>Approve Sign-Up</span>
        </button>
        <button
          disabled={!isAdmin}
          onClick={onReject}
          className="px-3.5 py-2 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-300 hover:bg-rose-500 hover:text-white text-xs font-serif font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <UserX size={14} />
          <span>Reject</span>
        </button>
      </div>
    </div>
  )
}
