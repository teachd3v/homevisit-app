import { create } from 'zustand'
import { api } from '../lib/api'

export interface FormResult {
  id: string
  candidateId: string
  candidateName: string
  visitorId: string
  scheduleId?: string
  interviewDate: string
  submittedAt: string
  partA: Array<{
    id: string
    label: string
    value: boolean
  }>
  partB: Array<{
    id: string
    label: string
    aspect: string
    value: 'yes' | 'maybe' | 'no'
    score: number
  }>
  notes: string
  partAPass: boolean
  partBTotal: number
  partBPercentage: number
}

interface FormResultsStore {
  results: FormResult[]
  setResults: (results: FormResult[]) => void
  addResult: (result: Omit<FormResult, 'id'>) => Promise<void>
  updateNotes: (id: string, notes: string) => Promise<void>
  updateResult: (id: string, updates: Partial<FormResult>) => Promise<void>
  deleteResult: (id: string) => Promise<void>
  getResultsByCandidate: (candidateId: string) => FormResult[]
  getResultsBySchedule: (scheduleId: string) => FormResult[]
  loadFromAPI: () => Promise<void>
}

export const useFormResultsStore = create<FormResultsStore>((set, get) => ({
  results: [],

  setResults: (results) => {
    set({ results })
  },

  loadFromAPI: async () => {
    try {
      const { data } = await api.get('/results')

      const mappedData = data.map((item: any) => ({
        id: item.id,
        candidateId: item.candidateId,
        visitorId: item.fasilId || '',
        candidateName: item.candidate?.full_name || 'Unknown',
        scheduleId: item.scheduleId || '', 
        interviewDate: new Date(item.createdAt || Date.now()).toISOString().split('T')[0],
        submittedAt: item.createdAt || new Date().toISOString(),
        partA: item.answers?.partA || [],
        partB: item.answers?.partB || [],
        notes: item.notes || '',
        partAPass: item.answers?.partAPass ?? true,
        partBTotal: item.score || 0,
        partBPercentage: item.score || 0,
      }))

      set({ results: mappedData })
    } catch (error) {
      console.error('Failed to load results:', error)
    }
  },

  addResult: async (result) => {
    try {
      const dbPayload = {
        candidateId: result.candidateId,
        fasilId: result.visitorId,
        answers: {
          partA: result.partA,
          partB: result.partB,
          partAPass: result.partAPass
        },
        score: result.partBTotal,
        status: 'submitted',
        notes: result.notes,
      }

      const { data: savedData } = await api.post('/results', dbPayload)

      const newResult: FormResult = {
        id: savedData.id,
        candidateId: savedData.candidateId,
        visitorId: savedData.fasilId || '',
        candidateName: result.candidateName,
        scheduleId: result.scheduleId,
        interviewDate: result.interviewDate,
        submittedAt: savedData.createdAt || new Date().toISOString(),
        partA: savedData.answers?.partA || [],
        partB: savedData.answers?.partB || [],
        notes: savedData.notes || '',
        partAPass: savedData.answers?.partAPass ?? true,
        partBTotal: savedData.score || 0,
        partBPercentage: savedData.score || 0,
      }

      set((state) => ({
        results: [newResult, ...state.results],
      }))
    } catch (error: any) {
      console.error('Failed to add result:', error)
      alert(`Error: ${error.message}`)
    }
  },

  updateNotes: async (id, notes) => {
    try {
      await api.put(`/results/${id}`, { notes })

      set((state) => ({
        results: state.results.map((r) => (r.id === id ? { ...r, notes } : r)),
      }))
    } catch (error) {
      console.error('Failed to update notes:', error)
    }
  },

  updateResult: async (id, updates) => {
    try {
      const dbPayload = {
        answers: {
          partA: updates.partA,
          partB: updates.partB,
          partAPass: updates.partAPass
        },
        score: updates.partBTotal,
        notes: updates.notes,
      }

      await api.put(`/results/${id}`, dbPayload)

      set((state) => ({
        results: state.results.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      }))
    } catch (error) {
      console.error('Failed to update result:', error)
    }
  },

  deleteResult: async (id) => {
    try {
      await api.delete(`/results/${id}`)

      set((state) => ({
        results: state.results.filter((r) => r.id !== id),
      }))
    } catch (error: any) {
      console.error('Failed to delete result:', error)
      alert(`Error: ${error.message}`)
    }
  },

  getResultsByCandidate: (candidateId) => {
    return get().results.filter((r) => r.candidateId === candidateId)
  },

  getResultsBySchedule: (scheduleId) => {
    return get().results.filter((r) => r.scheduleId === scheduleId)
  },
}))
