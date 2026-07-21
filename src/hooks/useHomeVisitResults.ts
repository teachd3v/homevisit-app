import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { HomeVisitResult } from '../types'

export const resultKeys = {
  all: ['results'] as const,
}

export const getResults = async (): Promise<HomeVisitResult[]> => {
  const { data } = await api.get('/results')
  return data
}

export function useHomeVisitResults() {
  return useQuery({
    queryKey: resultKeys.all,
    queryFn: getResults,
  })
}

export function useAddHomeVisitResult() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (result: Omit<HomeVisitResult, 'id'>) => {
      const { data } = await api.post('/results', result)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resultKeys.all })
    },
  })
}

export function useDeleteHomeVisitResult() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/results/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resultKeys.all })
    },
  })
}

export function useUpdateHomeVisitResult() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<HomeVisitResult> }) => {
      const { data } = await api.put(`/results/${id}`, updates)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resultKeys.all })
    },
  })
}
