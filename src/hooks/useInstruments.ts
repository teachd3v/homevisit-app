import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Instrument } from '../types'

export const instrumentKeys = {
  all: ['instruments'] as const,
}

export const getInstruments = async (): Promise<Instrument[]> => {
  const { data } = await api.get('/instruments')
  return data
}

export function useInstruments() {
  return useQuery({
    queryKey: instrumentKeys.all,
    queryFn: getInstruments,
  })
}

export function useAddInstrument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (instrument: Omit<Instrument, 'id'>) => {
      const { data } = await api.post('/instruments', instrument)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instrumentKeys.all })
    },
  })
}

export function useBulkAddInstruments() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (instruments: Omit<Instrument, 'id'>[]) => {
      const { data } = await api.post('/instruments/bulk', instruments)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instrumentKeys.all })
    },
  })
}

export function useDeleteInstrument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/instruments/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instrumentKeys.all })
    },
  })
}

export function useUpdateInstrument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Instrument> }) => {
      const { data } = await api.put(`/instruments/${id}`, updates)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: instrumentKeys.all })
    },
  })
}
