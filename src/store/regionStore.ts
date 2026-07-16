import { create } from 'zustand'

export interface Region {
  id: string
  name: string
}

export interface Campus {
  id: string
  name: string
  regionId?: string
}

interface RegionStore {
  regions: Region[]
  campuses: Campus[]
  loadFromAPI: () => Promise<void>
  addRegion: (name: string) => Promise<void>
  deleteRegion: (id: string) => Promise<void>
  updateRegion: (id: string, name: string) => Promise<void>
  addCampus: (name: string, regionId: string) => Promise<void>
  deleteCampus: (id: string) => Promise<void>
  updateCampus: (id: string, name: string, regionId: string) => Promise<void>
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useRegionStore = create<RegionStore>((set) => ({
  regions: [],
  campuses: [],

  loadFromAPI: async () => {
    try {
      const [regionsRes, campusesRes] = await Promise.all([
        fetch(`${API_URL}/regions`),
        fetch(`${API_URL}/campuses`)
      ])
      const regions = await regionsRes.json()
      const campuses = await campusesRes.json()
      set({ regions, campuses })
    } catch (error) {
      console.error('Failed to load regions/campuses:', error)
    }
  },

  addRegion: async (name: string) => {
    try {
      const res = await fetch(`${API_URL}/regions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      const data = await res.json()
      set((state) => ({ regions: [...state.regions, data] }))
    } catch (error) {
      console.error('Failed to add region:', error)
    }
  },

  deleteRegion: async (id: string) => {
    try {
      await fetch(`${API_URL}/regions/${id}`, { method: 'DELETE' })
      set((state) => ({
        regions: state.regions.filter((r) => r.id !== id),
        campuses: state.campuses.filter((s) => s.regionId !== id)
      }))
    } catch (error) {
      console.error('Failed to delete region:', error)
    }
  },

  updateRegion: async (id: string, name: string) => {
    try {
      const res = await fetch(`${API_URL}/regions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      const data = await res.json()
      set((state) => ({
        regions: state.regions.map((r) => r.id === id ? data : r)
      }))
    } catch (error) {
      console.error('Failed to update region:', error)
    }
  },

  addCampus: async (name: string, regionId: string) => {
    try {
      const res = await fetch(`${API_URL}/campuses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, regionId })
      })
      const data = await res.json()
      set((state) => ({ campuses: [...state.campuses, data] }))
    } catch (error) {
      console.error('Failed to add campus:', error)
    }
  },

  deleteCampus: async (id: string) => {
    try {
      await fetch(`${API_URL}/campuses/${id}`, { method: 'DELETE' })
      set((state) => ({
        campuses: state.campuses.filter((s) => s.id !== id)
      }))
    } catch (error) {
      console.error('Failed to delete campus:', error)
    }
  },

  updateCampus: async (id: string, name: string, regionId: string) => {
    try {
      const res = await fetch(`${API_URL}/campuses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, regionId })
      })
      const data = await res.json()
      set((state) => ({
        campuses: state.campuses.map((s) => s.id === id ? data : s)
      }))
    } catch (error) {
      console.error('Failed to update campus:', error)
    }
  }
}))


