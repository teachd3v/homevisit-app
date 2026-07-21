import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Candidate } from '../types'

// Keys for caching
export const candidateKeys = {
  all: ['candidates'] as const,
  detail: (id: string) => ['candidates', id] as const,
}

// Fetchers
export const getCandidates = async (): Promise<Candidate[]> => {
  const { data } = await api.get('/candidates')
  return data
}

// Hooks
export function useCandidates() {
  return useQuery({
    queryKey: candidateKeys.all,
    queryFn: getCandidates,
  })
}

export function useAddCandidate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (candidate: Candidate) => {
      const { data } = await api.post('/candidates', candidate)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.all })
    },
  })
}

export function useBulkAddCandidates() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (candidates: Candidate[]) => {
      const { data } = await api.post('/candidates/bulk', candidates)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.all })
    },
  })
}

export function useDeleteCandidate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/candidates/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.all })
    },
  })
}

export function useUpdateCandidate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Candidate> }) => {
      const { data } = await api.put(`/candidates/${id}`, updates)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.all })
    },
  })
}

export function useUpdateHomeVisitStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'lolos' | 'gagal' | 'pending' }) => {
      const { data } = await api.put(`/candidates/${id}`, { home_visit_status: status })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.all })
    },
  })
}

export function useUpdatePantukhirStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'lolos' | 'gagal' | null }) => {
      const { data } = await api.put(`/candidates/${id}`, { pantukhir_status: status })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.all })
    },
  })
}

export function useBulkUpdateHomeVisitStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: 'lolos' | 'gagal' | 'pending' }) => {
      await Promise.all(ids.map(id => api.put(`/candidates/${id}`, { home_visit_status: status })))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.all })
    },
  })
}
