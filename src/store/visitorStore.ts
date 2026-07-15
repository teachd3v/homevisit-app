import { create } from 'zustand'

export interface Visitor {
  id: string
  full_name?: string
  name?: string
  role: 'etoser' | 'mitra' | 'fasil'
  region?: string
  email?: string
}

interface VisitorStore {
  visitors: Visitor[]
  setVisitors: (visitors: Visitor[]) => void
  addVisitor: (visitor: Visitor) => Promise<void>
  bulkAddVisitors: (visitors: Visitor[]) => Promise<void>
  deleteVisitor: (id: string) => Promise<void>
  updateVisitor: (id: string, visitor: Partial<Visitor>) => Promise<void>
  getVisitorsByRole: (role: 'etoser' | 'mitra' | 'fasil') => Visitor[]
  loadFromAPI: () => Promise<void>
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useVisitorStore = create<VisitorStore>((set, get) => ({
  visitors: [],

  setVisitors: (visitors) => {
    set({ visitors })
  },

  loadFromAPI: async () => {
    try {
      const res = await fetch(`${API_URL}/visitors`)
      const data = await res.json()
      set({ visitors: data })
    } catch (error) {
      console.error('Failed to load visitors:', error)
    }
  },

  addVisitor: async (visitor) => {
    try {
      // Prisma uses "name", existing code uses "full_name" or "name"
      const payload = { ...visitor, name: visitor.full_name || visitor.name }
      const res = await fetch(`${API_URL}/visitors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      set((state) => ({ visitors: [...state.visitors, data] }))
    } catch (error) {
      console.error('Failed to add visitor:', error)
    }
  },

  bulkAddVisitors: async (visitors) => {
    try {
      const payloads = visitors.map(v => ({ ...v, name: v.full_name || v.name }))
      await fetch(`${API_URL}/visitors/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloads)
      })
      const res = await fetch(`${API_URL}/visitors`)
      const data = await res.json()
      set({ visitors: data })
    } catch (error) {
      console.error('Failed to bulk add visitors:', error)
    }
  },

  deleteVisitor: async (id) => {
    try {
      await fetch(`${API_URL}/visitors/${id}`, { method: 'DELETE' })
      set((state) => ({
        visitors: state.visitors.filter((i) => i.id !== id),
      }))
    } catch (error) {
      console.error('Failed to delete visitor:', error)
    }
  },

  updateVisitor: async (id, updates) => {
    try {
      const payload = { ...updates, name: updates.full_name || updates.name }
      const res = await fetch(`${API_URL}/visitors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      set((state) => ({
        visitors: state.visitors.map((i) => i.id === id ? data : i),
      }))
    } catch (error) {
      console.error('Failed to update visitor:', error)
    }
  },

  getVisitorsByRole: (role) => {
    return get().visitors.filter((i) => i.role === role)
  },
}))


