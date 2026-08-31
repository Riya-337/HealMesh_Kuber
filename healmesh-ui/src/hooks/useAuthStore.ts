import { create } from 'zustand'

export interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'OPERATOR' | 'VIEWER'
  status: 'ACTIVE' | 'PENDING' | 'REJECTED'
  createdAt: string
}

interface AuthState {
  currentUser: User | null
  users: User[]
  isAccessModalOpen: boolean
  setIsAccessModalOpen: (open: boolean) => void
  login: (email: string) => { success: boolean; message?: string }
  signup: (name: string, email: string) => { success: boolean; message: string }
  approveUser: (id: string) => void
  rejectUser: (id: string) => void
  switchUser: (user: User) => void
  logout: () => void
}

const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin',
    name: 'Riya Aggarwal',
    email: 'riya@healmesh.io',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: '2026-08-01 09:00:00',
  },
  {
    id: 'usr_alex',
    name: 'Alex Chen',
    email: 'alex@company.com',
    role: 'OPERATOR',
    status: 'ACTIVE',
    createdAt: '2026-08-15 14:22:00',
  },
  {
    id: 'usr_jordan',
    name: 'Jordan Smith',
    email: 'jordan@cloud.org',
    role: 'VIEWER',
    status: 'PENDING',
    createdAt: '2026-08-31 11:45:00',
  },
]

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: INITIAL_USERS[0], // Default logged-in as Riya Aggarwal (Admin)
  users: INITIAL_USERS,
  isAccessModalOpen: false,

  setIsAccessModalOpen: (open) => set({ isAccessModalOpen: open }),

  login: (email) => {
    const user = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user) {
      return { success: false, message: 'User account not found. Please request access.' }
    }
    if (user.status === 'PENDING') {
      return {
        success: false,
        message: 'Your account is pending approval by the Admin (Riya Aggarwal). Access is restricted until approved.',
      }
    }
    if (user.status === 'REJECTED') {
      return { success: false, message: 'Access request was rejected by Admin.' }
    }
    set({ currentUser: user })
    return { success: true }
  },

  signup: (name, email) => {
    const existing = get().users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (existing) {
      return { success: false, message: 'An account with this email already exists.' }
    }
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role: 'VIEWER',
      status: 'PENDING',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    }
    set((state) => ({ users: [newUser, ...state.users] }))
    return {
      success: true,
      message: 'Access request submitted! Your account is pending review by Admin (Riya Aggarwal).',
    }
  },

  approveUser: (id) => {
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, status: 'ACTIVE' } : u)),
    }))
  },

  rejectUser: (id) => {
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, status: 'REJECTED' } : u)),
    }))
  },

  switchUser: (user) => {
    set({ currentUser: user })
  },

  logout: () => {
    set({ currentUser: null })
  },
}))
