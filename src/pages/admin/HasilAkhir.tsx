import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCandidateStore } from '../../store/candidateStore'
import { useHomeVisitStore } from '../../store/homeVisitStore'
import { useVisitorStore } from '../../store/visitorStore'

export default function HasilAkhir() {
  const candidates = useCandidateStore((state) => state.candidates)
  const results = useHomeVisitStore((state) => state.results)
  const visitors = useVisitorStore((state) => state.visitors)
  const loadCandidates = useCandidateStore((state) => state.loadFromAPI)
  const loadResults = useHomeVisitStore((state) => state.loadFromAPI)
  const loadVisitors = useVisitorStore((state) => state.loadFromAPI)
  const updatePantukhirStatus = useCandidateStore((state) => state.updatePantukhirStatus)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('All')

  // Modals state
  const [notesModalOpen, setNotesModalOpen] = useState<string | null>(null) // result ID
  const [docsModalOpen, setDocsModalOpen] = useState<string | null>(null) // result ID
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null) // photo base64
  const [actionModalOpen, setActionModalOpen] = useState<string | null>(null) // candidate ID

  const [expandedRegions, setExpandedRegions] = useState<string[]>([])
  const [expandedCandidates, setExpandedCandidates] = useState<string[]>([])

  const toggleRegion = (region: string) => {
    setExpandedRegions(prev => prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region])
  }

  const toggleCandidate = (id: string) => {
    setExpandedCandidates(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  useEffect(() => {
    loadCandidates()
    loadResults()
    loadVisitors()
  }, [])

  const getVisitorName = (id: string) => {
    return visitors.find(i => i.id === id)?.name || '-'
  }

  const getLikertScore = (r: any) => {
    if (!r) return null
    return r.score || 0
  }

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRegion = selectedRegion === 'All' || (c.region === selectedRegion) || (!c.region && selectedRegion === 'Lainnya')
    return matchesSearch && matchesRegion
  })

  const uniqueRegions = Array.from(new Set(candidates.map(c => c.region || 'Lainnya'))).sort()

  const handleAction = async (candidateId: string, status: 'lolos' | 'gagal' | null) => {
    await updatePantukhirStatus(candidateId, status)
    setActionModalOpen(null)
  }

  const groupedCandidates = filteredCandidates.reduce((acc, c) => {
    const reg = c.region || 'Lainnya'
    if (!acc[reg]) acc[reg] = []
    acc[reg].push(c)
    return acc
  }, {} as Record<string, typeof candidates>)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 md:px-6 md:py-4 flex justify-between items-center gap-4">
          <Link to="/admin" className="w-9 h-9 shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 shrink-0">Pantukhir</h1>
          <div className="flex-1"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar & Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative max-w-md flex-1">
            <input
              type="text"
              placeholder="Cari nama atau ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
            />
            <span className="absolute left-4 top-3 text-slate-400">🔍</span>
          </div>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-700 min-w-[180px]"
          >
            <option value="All">Semua Wilayah</option>
            {uniqueRegions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden space-y-4 mb-8">
          {Object.entries(groupedCandidates).map(([region, cands]) => (
            <div key={region} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <button
                onClick={() => toggleRegion(region)}
                className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between focus:outline-none"
              >
                <span className="font-bold text-slate-800">{region} <span className="text-slate-500 text-sm font-normal">({cands.length})</span></span>
                <span className="text-slate-400 text-xs">
                  {expandedRegions.includes(region) ? '▼' : '▶'}
                </span>
              </button>
              
              {expandedRegions.includes(region) && (
                <div className="divide-y divide-slate-100 p-2">
                  {cands.map(c => {
                    const result = results.find(r => r.candidateId === c.id)
                    const score = getLikertScore(result)
                    const isExpanded = expandedCandidates.includes(c.id)

                    return (
                      <div key={c.id} className="p-3 bg-white rounded-lg border border-slate-100 mb-2 last:mb-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-800 text-sm leading-tight">{c.full_name}</h3>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {result ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800">Visited</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-800">Not Visited</span>
                              )}
                              
                              {c.pantukhir_status === 'lolos' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800">Lolos</span>
                              )}
                              {c.pantukhir_status === 'gagal' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-800">Tidak Lolos</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => toggleCandidate(c.id)}
                            className="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-500 rounded-full shrink-0"
                          >
                            {isExpanded ? '▲' : '▼'}
                          </button>
                        </div>
                        
                        {isExpanded && (
                          <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-500">Visitor:</span>
                              <span className="text-xs font-semibold text-slate-800">{result ? getVisitorName(result.fasilId) : '-'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-500">Skor:</span>
                              <span className="text-xs font-bold text-slate-800">{score !== null ? score.toFixed(1) + '%' : '-'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-slate-500">UKT:</span>
                              <span className="text-xs font-semibold text-slate-800">{c.ukt || '-'}</span>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 pt-2">
                              <button
                                onClick={() => result && setNotesModalOpen(result.id)}
                                disabled={!result}
                                className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-lg disabled:opacity-30"
                              >
                                <span>👁️</span>
                                <span className="text-[10px] text-slate-600 mt-1">Catatan</span>
                              </button>
                              <button
                                onClick={() => result && setDocsModalOpen(result.id)}
                                disabled={!result}
                                className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-lg disabled:opacity-30"
                              >
                                <span>👁️</span>
                                <span className="text-[10px] text-slate-600 mt-1">Foto</span>
                              </button>
                              <button
                                onClick={() => setActionModalOpen(c.id)}
                                className="flex flex-col items-center justify-center p-2 bg-blue-50 text-blue-600 rounded-lg"
                              >
                                <span>💬</span>
                                <span className="text-[10px] font-medium mt-1">Aksi</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
          {Object.keys(groupedCandidates).length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">Tidak ada data kandidat.</div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Kandidat</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Wilayah</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Visitor</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Catatan</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Skor</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">UKT</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Dokumentasi</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCandidates.map(candidate => {
                  const result = results.find(r => r.candidateId === candidate.id)
                  const score = getLikertScore(result)
                  
                  return (
                    <tr key={candidate.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900">{candidate.full_name}</span>
                          <span className="text-xs text-slate-500">{candidate.id} • {candidate.campus}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {candidate.region || 'Lainnya'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {result ? getVisitorName(result.fasilId) : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          {result ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Visited
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                              Not Visited
                            </span>
                          )}
                          
                          {candidate.pantukhir_status === 'lolos' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Lolos
                            </span>
                          )}
                          {candidate.pantukhir_status === 'gagal' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              Tidak Lolos
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => result && setNotesModalOpen(result.id)}
                          disabled={!result}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                        >
                          👁️
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {score !== null ? (
                          <span className="text-sm font-bold text-slate-700">{score.toFixed(1)}%</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-700">{candidate.ukt || '-'}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => result && setDocsModalOpen(result.id)}
                          disabled={!result}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                        >
                          👁️
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setActionModalOpen(candidate.id)}
                          className="p-2 text-blue-600 hover:bg-blue-100 bg-blue-50 rounded-lg transition-colors shadow-sm border border-blue-200"
                          title="Beri Keputusan Pantukhir"
                        >
                          💬
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {filteredCandidates.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                      Tidak ada data kandidat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL CATATAN */}
      {notesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Catatan Observasi</h3>
              <button onClick={() => setNotesModalOpen(null)} className="text-slate-400 hover:text-slate-600">✖</button>
            </div>
            <div className="p-6 overflow-y-auto">
              {(() => {
                const res = results.find(r => r.id === notesModalOpen)
                if (!res) return null
                return (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-sm text-slate-800 mb-2">Semua Pertanyaan & Catatan:</h4>
                      <div className="space-y-4">
                        {(res.answers || []).map((item: any, i: number) => {
                          const emoticons = [
                            { val: 1, label: '😢', text: 'Sangat Tidak Sesuai' },
                            { val: 2, label: '🙁', text: 'Tidak Sesuai' },
                            { val: 3, label: '😐', text: 'Cukup Sesuai' },
                            { val: 4, label: '🙂', text: 'Sesuai' },
                            { val: 5, label: '😄', text: 'Sangat Sesuai' }
                          ]
                          const ratingVal = item.rating || item.score || 0
                          const emo = emoticons.find(e => e.val === ratingVal)
                          return (
                            <div key={i} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                              <p className="text-sm font-medium text-slate-800 mb-2">{item.pertanyaan || item.label}</p>
                              <div className="inline-flex items-center gap-2 bg-white px-2 py-1 rounded border border-slate-200 mb-2">
                                <span className="text-lg leading-none">{emo?.label || '❓'}</span>
                                <span className="text-[10px] font-bold text-slate-700 uppercase">Skala: {ratingVal} ({emo?.text || 'Belum Dijawab'})</span>
                              </div>
                              <p className="text-xs text-slate-500 italic block mt-1">Catatan: {item.note || '-'}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end rounded-b-xl">
              <button onClick={() => setNotesModalOpen(null)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DOKUMENTASI */}
      {docsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Dokumentasi Observasi</h3>
              <button onClick={() => setDocsModalOpen(null)} className="text-slate-400 hover:text-slate-600">✖</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(() => {
                  const res = results.find(r => r.id === docsModalOpen)
                  if (!res) return null
                  const photos: any[] = []
                  if (res.photos) {
                    if (res.photos.tampakDepan) photos.push({ name: 'Tampak Depan Rumah', data: res.photos.tampakDepan })
                    if (res.photos.tampakDapur) photos.push({ name: 'Tampak Dapur', data: res.photos.tampakDapur })
                    if (res.photos.bersamaKeluarga) photos.push({ name: 'Bersama Keluarga', data: res.photos.bersamaKeluarga })
                    if (res.photos.beritaAcara) photos.push({ name: 'Berita Acara', data: res.photos.beritaAcara })
                    if (res.photos.formHomeVisit && res.photos.formHomeVisit.length > 0) {
                      res.photos.formHomeVisit.forEach((url: string, i: number) => {
                        photos.push({ name: `Form Home Visit ${i+1}`, data: url })
                      })
                    }
                  }
                  if (photos.length === 0) return <div className="col-span-full text-center text-slate-500 py-4">Tidak ada dokumentasi foto.</div>
                  return photos.map((photo: any, i: number) => (
                    <div key={i} className="group relative aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-50 cursor-pointer" onClick={() => setPreviewPhoto(photo.data)}>
                      <img src={photo.data} alt={`Dokumentasi ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white font-medium text-sm drop-shadow-md">Lihat Penuh</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                        <p className="text-white text-[10px] truncate">{photo.name}</p>
                      </div>
                    </div>
                  ))
                })()}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end rounded-b-xl">
              <button onClick={() => setDocsModalOpen(null)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN PHOTO PREVIEW */}
      {previewPhoto && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setPreviewPhoto(null)}>
          <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors" onClick={() => setPreviewPhoto(null)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img src={previewPhoto} alt="Fullscreen Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* MODAL AKSI PANTUKHIR */}
      {actionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 text-center">Keputusan Pantukhir</h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 text-center mb-6">Tentukan status akhir untuk kandidat ini.</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleAction(actionModalOpen, 'lolos')}
                  className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-sm transition-all flex justify-center items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Lolos
                </button>
                <button
                  onClick={() => handleAction(actionModalOpen, 'gagal')}
                  className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-sm transition-all flex justify-center items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Tidak Lolos
                </button>
                <button
                  onClick={() => handleAction(actionModalOpen, null)}
                  className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg shadow-sm transition-all flex justify-center items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Reset Keputusan
                </button>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-center rounded-b-xl">
              <button onClick={() => setActionModalOpen(null)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 w-full">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



