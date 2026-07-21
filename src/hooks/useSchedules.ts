import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Schedule } from '../types'

export const scheduleKeys = {
  all: ['schedules'] as const,
}

export const getSchedules = async (): Promise<Schedule[]> => {
  const { data } = await api.get('/schedules')
  return data
}

export function useSchedules() {
  return useQuery({
    queryKey: scheduleKeys.all,
    queryFn: getSchedules,
  })
}

export function useAddSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (schedule: Omit<Schedule, 'id'>) => {
      const { data } = await api.post('/schedules', schedule)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all })
    },
  })
}

export function useBulkAddSchedules() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (schedules: Omit<Schedule, 'id'>[]) => {
      await Promise.all(schedules.map(schedule => api.post('/schedules', schedule)))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all })
    },
  })
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/schedules/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all })
    },
  })
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Schedule> }) => {
      const { data } = await api.put(`/schedules/${id}`, updates)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all })
    },
  })
}
