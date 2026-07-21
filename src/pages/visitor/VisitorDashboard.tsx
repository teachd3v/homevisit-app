import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useSchedules } from '../../hooks/useSchedules'
import { useCandidates } from '../../hooks/useCandidates'
import { useHomeVisitResults } from '../../hooks/useHomeVisitResults'

export default function VisitorDashboard() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const role = useAuthStore((state) => state.role)
  const visitorId = useAuthStore((state) => state.visitorId)
  const visitorName = useAuthStore((state) => state.visitorName)

  const { data: allSchedules = [] } = useSchedules()
  const { data: candidates = [] } = useCandidates()
  const { data: homeVisitResults = [] } = useHomeVisitResults()

  const [expandedSchedules, setExpandedSchedules] = useState<string[]>([])

  useEffect(() => {
    

    const handleFocus = () => {
      
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  useEffect(() => {
    if (!visitorId || !role || role === 'admin') {
      navigate('/visitor/select')
    }
  }, [visitorId, role, navigate])

  const schedules = allSchedules
    .filter((schedule) => schedule.visitorId === visitorId)
    .sort((a, b) => new Date(a.schedule_date).getTime() - new Date(b.schedule_date).getTime())

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleChangeVisitor = () => {
    navigate('/visitor/select')
  }

  const toggleScheduleExpand = (id: string) => {
    setExpandedSchedules(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const getHomeVisitResult = (candidateId: string) => {
    return homeVisitResults.find(r => r.candidateId === candidateId)
  }

  const assignedCandidateIds = Array.from(
    new Set(schedules.map((s) => s.candidateId))
  )

  const groupedCandidates = assignedCandidateIds.reduce((acc, candId) => {
    const candidateObj = candidates.find((c) => c.id === candId)
    if (!candidateObj) return acc
    const regionName = candidateObj.region || 'Lainnya'
    if (!acc[regionName]) acc[regionName] = []
    acc[regionName].push(candidateObj)
    return acc
  }, {} as Record<string, typeof candidates>)

  const regionEntries = Object.entries(groupedCandidates)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={handleChangeVisitor}
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
              title="Ubah Visitor"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🏠 Observasi Home Visit</h1>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Visitor:</span> {visitorName} <span className="text-gray-400">({role})</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg transition-colors text-xs md:text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Daftar Kandidat Home Visit</h2>
        {regionEntries.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center shadow-sm">
            <p className="text-gray-600 text-lg">Belum ada jadwal observasi yang ditugaskan.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {regionEntries.map(([regionName, regionCandidates]) => {
              const isExpanded = expandedSchedules.includes(regionName)
              const candidateCount = regionCandidates.length

              return (
                <div key={regionName} className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 pr-2">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800 text-base">📍 Wilayah {regionName}</span>
                      </div>
                      <p className="text-xs text-slate-500">{candidateCount} Kandidat</p>
                    </div>
                    <button
                      onClick={() => toggleScheduleExpand(regionName)}
                      className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 active:scale-90 transition-all border border-slate-100 shrink-0"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        className={`w-4 h-4 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-100 space-y-2 animate-in fade-in-50 duration-200">
                      {regionCandidates.map((candidate) => {
                        const candId = candidate.id
                        const homeVisitData = getHomeVisitResult(candId)
                        return (
                          <div key={candId} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                            <div className="flex-1 pr-2">
                              <span className="font-bold text-slate-800 block text-sm">{candidate.full_name}</span>
                              <span className="text-[10px] text-slate-500">ID: {candId}</span>
                            </div>
                            {homeVisitData ? (
                              <Link
                                to={`/visitor/hasil-home-visit-detail/${homeVisitData.id}`}
                                className="bg-green-50 hover:bg-green-100 text-green-700 font-bold py-1.5 px-3 rounded-lg transition-all shrink-0 text-center border border-green-200"
                              >
                                Lihat Hasil
                              </Link>
                            ) : (
                              <Link
                                to={`/visitor/home-visit/${candId}`}
                                className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-1.5 px-3 rounded-lg transition-all shrink-0 text-center shadow-sm"
                              >
                                Mulai Observasi
                              </Link>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

