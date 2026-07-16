import { useLoadingStore } from '../store/loadingStore'
import { useEffect, useState } from 'react'

export default function GlobalLoader() {
  const activeRequests = useLoadingStore(state => state.activeRequests)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeRequests > 0) {
      setProgress(15)
      interval = setInterval(() => {
        setProgress(p => (p < 85 ? p + (85 - p) * 0.1 : p))
      }, 200)
    } else {
      setProgress(100)
      const timeout = setTimeout(() => setProgress(0), 300)
      return () => clearTimeout(timeout)
    }
    return () => clearInterval(interval)
  }, [activeRequests])

  if (progress === 0) return null

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[9999] pointer-events-none">
      <div 
        className="h-full bg-indigo-600 transition-all duration-200 ease-out shadow-[0_0_10px_rgba(79,70,229,0.7)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
