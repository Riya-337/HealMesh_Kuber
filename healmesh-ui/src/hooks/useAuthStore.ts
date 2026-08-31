import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  simulateIncomingRequest: (name?: string, email?: string) => void
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
  {
    id: 'usr_riya_demo',
    name: 'Riya (Applicant)',
    email: 'riya12356@gmail.com',
    role: 'VIEWER',
    status: 'PENDING',
    createdAt: '2026-08-31 19:54:00',
  },
]

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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
        const trimmedEmail = email.trim().toLowerCase()
        const trimmedName = name.trim()
        const existing = get().users.find((u) => u.email.toLowerCase() === trimmedEmail)

        if (existing) {
          set((state) => ({
            users: state.users.map((u) =>
              u.email.toLowerCase() === trimmedEmail
                ? {
                    ...u,
                    name: trimmedName || u.name,
                    status: 'PENDING',
                    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
                  }
                : u
            ),
          }))
          return {
            success: true,
            message: 'Access request submitted! Your account is pending review by Admin (Riya Aggarwal).',
          }
        }

        const newUser: User = {
          id: `usr_${Date.now()}`,
          name: trimmedName,
          email: trimmedEmail,
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

      simulateIncomingRequest: (name = 'Samira Khan (SRE)', email?: string) => {
        const randomNum = Math.floor(Math.random() * 900) + 100
        const applicantEmail = email || `applicant_${randomNum}@mesh.dev`
        const id = `usr_${Date.now()}`
        const newUser: User = {
          id,
          name: `${name} #${randomNum}`,
          email: applicantEmail,
          role: 'VIEWER',
          status: 'PENDING',
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        }
        set((state) => ({ users: [newUser, ...state.users] }))
      },

      approveUser: (id) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, status: 'ACTIVE' } : u)),
        }))
      },

      rejectUser: (id) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }))
      },

      switchUser: (user) => {
        set({ currentUser: user })
      },

      logout: () => {
        set({ currentUser: null })
      },
    }),
    {
      name: 'healmesh-auth-store-v2',
    }
  )
)
