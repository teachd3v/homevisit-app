import { useLoadingStore } from '../store/loadingStore'

export default function GlobalLoader() {
  const activeRequests = useLoadingStore(state => state.activeRequests)

  if (activeRequests === 0) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-200">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-slate-600 font-medium animate-pulse">Memuat Data...</p>
      </div>
    </div>
  )
}
