import { create } from 'zustand'

export interface Instrument {
  id: string
  pertanyaan: string
  urutan: number
}

interface InstrumentStore {
  instruments: Instrument[]
  setInstruments: (instruments: Instrument[]) => void
  addInstrument: (instrument: Omit<Instrument, 'id'>) => Promise<void>
  bulkAddInstruments: (instruments: Omit<Instrument, 'id'>[]) => Promise<void>
  deleteInstrument: (id: string) => Promise<void>
  updateInstrument: (id: string, instrument: Partial<Instrument>) => Promise<void>
  loadFromAPI: () => Promise<void>
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useInstrumentStore = create<InstrumentStore>((set) => ({
  instruments: [],

  setInstruments: (instruments) => {
    set({ instruments })
  },

  loadFromAPI: async () => {
    try {
      const res = await fetch(`${API_URL}/instruments`)
      const data = await res.json()
      set({ instruments: data })
    } catch (error) {
      console.error('Failed to load instruments:', error)
    }
  },

  addInstrument: async (instrument) => {
    try {
      const res = await fetch(`${API_URL}/instruments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(instrument)
      })
      const data = await res.json()
      set((state) => ({ instruments: [...state.instruments, data] }))
    } catch (error) {
      console.error('Failed to add instrument:', error)
    }
  },

  bulkAddInstruments: async (instruments) => {
    try {
      await fetch(`${API_URL}/instruments/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(instruments)
      })
      const res = await fetch(`${API_URL}/instruments`)
      const data = await res.json()
      set({ instruments: data })
    } catch (error) {
      console.error('Failed to bulk add instruments:', error)
    }
  },

  deleteInstrument: async (id) => {
    try {
      await fetch(`${API_URL}/instruments/${id}`, { method: 'DELETE' })
      set((state) => ({
        instruments: state.instruments.filter((i) => i.id !== id),
      }))
    } catch (error) {
      console.error('Failed to delete instrument:', error)
    }
  },

  updateInstrument: async (id, updates) => {
    try {
      const res = await fetch(`${API_URL}/instruments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const data = await res.json()
      set((state) => ({
        instruments: state.instruments.map((i) => i.id === id ? data : i),
      }))
    } catch (error) {
      console.error('Failed to update instrument:', error)
    }
  },
}))

