import { create } from 'zustand'

interface LoadingStore {
  activeRequests: number
  startLoading: () => void
  stopLoading: () => void
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  activeRequests: 0,
  startLoading: () => set((state) => ({ activeRequests: state.activeRequests + 1 })),
  stopLoading: () => set((state) => ({ activeRequests: Math.max(0, state.activeRequests - 1) }))
}))

const originalFetch = window.fetch;
window.fetch = async (...args) => {
  useLoadingStore.getState().startLoading();
  try {
    const response = await originalFetch(...args);
    return response;
  } finally {
    useLoadingStore.getState().stopLoading();
  }
};
