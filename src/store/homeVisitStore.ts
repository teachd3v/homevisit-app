import { create } from 'zustand'

export interface HomeVisitResult {
  id: string
  candidateId: string
  fasilId: string
  submittedAt: string
  answers: Array<{
    id: string
    pertanyaan: string
    score: number
    note?: string
  }>
  score: number
  status: string
  notes?: string
  photos?: any
}

interface HomeVisitStore {
  results: HomeVisitResult[]
  setResults: (results: HomeVisitResult[]) => void
  addResult: (result: Omit<HomeVisitResult, 'id'>) => Promise<void>
  loadFromAPI: () => Promise<void>
  getResultsByCandidate: (candidateId: string) => HomeVisitResult | undefined
  deleteResult: (id: string) => Promise<void>
  updateResult: (id: string, updates: Partial<HomeVisitResult>) => Promise<void>
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useHomeVisitStore = create<HomeVisitStore>((set, get) => ({
  results: [],

  setResults: (results) => {
    set({ results })
  },

  loadFromAPI: async () => {
    try {
      const res = await fetch(`${API_URL}/results`)
      if (!res.ok) throw new Error("Server error"); const data = await res.json()
      set({ results: data })
    } catch (error) {
      console.error('Failed to load results:', error)
    }
  },

  addResult: async (result) => {
    try {
      const res = await fetch(`${API_URL}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      })
      if (!res.ok) throw new Error("Server error"); const data = await res.json()
      set((state) => ({ results: [...state.results, data] }))
    } catch (error) {
      console.error('Failed to add result:', error); throw error;
    }
  },

  getResultsByCandidate: (candidateId) => {
    return get().results.find((r) => r.candidateId === candidateId)
  },

  deleteResult: async (id) => {
    try {
      await fetch(`${API_URL}/results/${id}`, { method: 'DELETE' })
      set((state) => ({
        results: state.results.filter((r) => r.id !== id),
      }))
    } catch (error) {
      console.error('Failed to delete result:', error)
    }
  },

  updateResult: async (id, updates) => {
    try {
      const res = await fetch(`${API_URL}/results/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (!res.ok) throw new Error("Server error"); const data = await res.json()
      set((state) => ({
        results: state.results.map((r) => r.id === id ? data : r),
      }))
    } catch (error) {
      console.error('Failed to update result:', error)
    }
  },
}))



