import { create } from 'zustand'

export interface Candidate {
  id: string
  full_name: string
  campus: string
  region: string
  gender: string
  major: string
  ukt?: string
  home_visit_status?: 'pending' | 'lolos' | 'gagal'
  pantukhir_status?: 'lolos' | 'gagal' | null
}

interface CandidateStore {
  candidates: Candidate[]
  setCandidates: (candidates: Candidate[]) => void
  addCandidate: (candidate: Candidate) => Promise<void>
  bulkAddCandidates: (candidates: Candidate[]) => Promise<void>
  deleteCandidate: (id: string) => Promise<void>
  updateCandidate: (id: string, candidate: Partial<Candidate>) => Promise<void>
  updateHomeVisitStatus: (id: string, status: 'lolos' | 'gagal' | 'pending') => Promise<void>
  bulkUpdateHomeVisitStatus: (ids: string[], status: 'lolos' | 'gagal' | 'pending') => Promise<void>
  updatePantukhirStatus: (id: string, status: 'lolos' | 'gagal' | null) => Promise<void>
  loadFromAPI: () => Promise<void>
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useCandidateStore = create<CandidateStore>((set) => ({
  candidates: [],

  setCandidates: (candidates) => {
    set({ candidates })
  },

  loadFromAPI: async () => {
    try {
      const res = await fetch(`${API_URL}/candidates`)
      const data = await res.json()
      set({ candidates: data })
    } catch (error) {
      console.error('Failed to load candidates:', error)
    }
  },

  addCandidate: async (candidate) => {
    try {
      const res = await fetch(`${API_URL}/candidates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidate)
      })
      const data = await res.json()
      set((state) => ({ candidates: [...state.candidates, data] }))
    } catch (error) {
      console.error('Failed to add candidate:', error)
    }
  },

  bulkAddCandidates: async (candidates) => {
    try {
      await fetch(`${API_URL}/candidates/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidates)
      })
      // Reload to get consistent data
      const res = await fetch(`${API_URL}/candidates`)
      const data = await res.json()
      set({ candidates: data })
    } catch (error) {
      console.error('Failed to bulk add candidates:', error)
    }
  },

  deleteCandidate: async (id) => {
    try {
      await fetch(`${API_URL}/candidates/${id}`, { method: 'DELETE' })
      set((state) => ({
        candidates: state.candidates.filter((c) => c.id !== id),
      }))
    } catch (error) {
      console.error('Failed to delete candidate:', error)
    }
  },

  updateCandidate: async (id, updates) => {
    try {
      const res = await fetch(`${API_URL}/candidates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const data = await res.json()
      set((state) => ({
        candidates: state.candidates.map((c) => c.id === id ? data : c),
      }))
    } catch (error) {
      console.error('Failed to update candidate:', error)
    }
  },

  updateHomeVisitStatus: async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/candidates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ home_visit_status: status })
      })
      const data = await res.json()
      set((state) => ({
        candidates: state.candidates.map((c) => c.id === id ? data : c),
      }))
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  },

  updatePantukhirStatus: async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/candidates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pantukhir_status: status })
      })
      const data = await res.json()
      set((state) => ({
        candidates: state.candidates.map((c) => c.id === id ? data : c),
      }))
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  },

  bulkUpdateHomeVisitStatus: async (ids, status) => {
    try {
      await Promise.all(ids.map(id => 
        fetch(`${API_URL}/candidates/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ home_visit_status: status })
        })
      ))
      const res = await fetch(`${API_URL}/candidates`)
      const data = await res.json()
      set({ candidates: data })
    } catch (error) {
      console.error('Failed to bulk update status:', error)
    }
  },
}))


