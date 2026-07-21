import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Visitor } from '../types'

export const visitorKeys = {
  all: ['visitors'] as const,
}

export const getVisitors = async (): Promise<Visitor[]> => {
  const { data } = await api.get('/visitors')
  return data
}

export function useVisitors() {
  return useQuery({
    queryKey: visitorKeys.all,
    queryFn: getVisitors,
  })
}

export function useAddVisitor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (visitor: Visitor) => {
      const payload = { ...visitor }
      const { data } = await api.post('/visitors', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: visitorKeys.all })
    },
  })
}

export function useBulkAddVisitors() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (visitors: Visitor[]) => {
      const payloads = visitors.map(v => ({ ...v }))
      const { data } = await api.post('/visitors/bulk', payloads)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: visitorKeys.all })
    },
  })
}

export function useDeleteVisitor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/visitors/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: visitorKeys.all })
    },
  })
}

export function useUpdateVisitor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Visitor> }) => {
      const payload = { ...updates }
      const { data } = await api.put(`/visitors/${id}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: visitorKeys.all })
    },
  })
}
