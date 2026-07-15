import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthStore {
  role: string | null
  visitorId: string | null
  visitorName: string | null
  setRole: (role: 'admin' | 'etoser' | 'mitra' | 'fasil' | null) => void
  setVisitor: (id: string, name: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      role: null,
      visitorId: null,
      visitorName: null,

      setRole: (role) => {
        set({ role })
      },

      setVisitor: (id, name) => {
        set({ visitorId: id, visitorName: name })
      },

      logout: () => {
        set({ role: null, visitorId: null, visitorName: null })
      },
    }),
    {
      name: 'auth-store',
    }
  )
)


