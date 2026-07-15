import { create } from 'zustand'

export interface Schedule {
  id: string
  candidateId: string
  visitorId: string
  schedule_date: string
  schedule_time?: string
  status: string
  notes?: string
}

interface ScheduleStore {
  schedules: Schedule[]
  setSchedules: (schedules: Schedule[]) => void
  addSchedule: (schedule: Omit<Schedule, 'id'>) => Promise<void>
  bulkAddSchedules: (schedules: Omit<Schedule, 'id'>[]) => Promise<void>
  deleteSchedule: (id: string) => Promise<void>
  updateSchedule: (id: string, updates: Partial<Schedule>) => Promise<void>
  loadFromAPI: () => Promise<void>
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const useScheduleStore = create<ScheduleStore>((set) => ({
  schedules: [],

  setSchedules: (schedules) => {
    set({ schedules })
  },

  loadFromAPI: async () => {
    try {
      const res = await fetch(`${API_URL}/schedules`)
      const data = await res.json()
      set({ schedules: data })
    } catch (error) {
      console.error('Failed to load schedules:', error)
    }
  },

  addSchedule: async (schedule) => {
    try {
      const res = await fetch(`${API_URL}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule)
      })
      const data = await res.json()
      set((state) => ({ schedules: [...state.schedules, data] }))
    } catch (error) {
      console.error('Failed to add schedule:', error)
    }
  },

  bulkAddSchedules: async (schedules) => {
    try {
      // Create one by one or create a bulk endpoint in backend.
      // Assuming no bulk endpoint for schedule yet, we do Promise.all
      await Promise.all(schedules.map(schedule => 
        fetch(`${API_URL}/schedules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(schedule)
        })
      ))
      const res = await fetch(`${API_URL}/schedules`)
      const data = await res.json()
      set({ schedules: data })
    } catch (error) {
      console.error('Failed to bulk add schedules:', error)
    }
  },

  deleteSchedule: async (id) => {
    try {
      await fetch(`${API_URL}/schedules/${id}`, { method: 'DELETE' })
      set((state) => ({
        schedules: state.schedules.filter((s) => s.id !== id),
      }))
    } catch (error) {
      console.error('Failed to delete schedule:', error)
    }
  },

  updateSchedule: async (id, updates) => {
    try {
      const res = await fetch(`${API_URL}/schedules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const data = await res.json()
      set((state) => ({
        schedules: state.schedules.map((s) => s.id === id ? data : s),
      }))
    } catch (error) {
      console.error('Failed to update schedule:', error)
    }
  },
}))

