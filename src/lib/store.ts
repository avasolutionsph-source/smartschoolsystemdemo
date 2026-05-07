import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role } from '@/types'

interface SessionState {
  role: Role
  displayName: string
  email: string
  loggedIn: boolean
  login: (role: Role, email: string, displayName: string) => void
  setRole: (role: Role) => void
  logout: () => void
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      role: 'admin',
      displayName: 'Demo User',
      email: '',
      loggedIn: false,
      login: (role, email, displayName) =>
        set({ role, email, displayName, loggedIn: true }),
      setRole: (role) => set({ role }),
      logout: () => set({ loggedIn: false }),
    }),
    { name: 'abc-sss-session' },
  ),
)
