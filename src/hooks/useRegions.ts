import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Region, Campus } from '../types'

export const regionKeys = {
  regions: ['regions'] as const,
  campuses: ['campuses'] as const,
}

export const getRegions = async (): Promise<Region[]> => {
  const { data } = await api.get('/regions')
  return data
}

export const getCampuses = async (): Promise<Campus[]> => {
  const { data } = await api.get('/campuses')
  return data
}

export function useRegions() {
  return useQuery({
    queryKey: regionKeys.regions,
    queryFn: getRegions,
  })
}

export function useCampuses() {
  return useQuery({
    queryKey: regionKeys.campuses,
    queryFn: getCampuses,
  })
}

export function useAddRegion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await api.post('/regions', { name })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: regionKeys.regions }),
  })
}

export function useDeleteRegion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/regions/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: regionKeys.regions })
      queryClient.invalidateQueries({ queryKey: regionKeys.campuses })
    },
  })
}

export function useUpdateRegion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { data } = await api.put(`/regions/${id}`, { name })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: regionKeys.regions }),
  })
}

export function useAddCampus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, regionId }: { name: string; regionId: string }) => {
      const { data } = await api.post('/campuses', { name, regionId })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: regionKeys.campuses }),
  })
}

export function useDeleteCampus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/campuses/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: regionKeys.campuses }),
  })
}

export function useUpdateCampus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name, regionId }: { id: string; name: string; regionId: string }) => {
      const { data } = await api.put(`/campuses/${id}`, { name, regionId })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: regionKeys.campuses }),
  })
}
