import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { useHomeVisitStore } from '../../store/homeVisitStore'
import { useCandidateStore } from '../../store/candidateStore'
import { useVisitorStore } from '../../store/visitorStore'
import { useRegionStore } from '../../store/regionStore'
import ConfirmModal from '../../components/ConfirmModal'

export default function HasilHomeVisit() {
  const navigate = useNavigate()
  const results = useHomeVisitStore((state) => state.results)
  const candidates = useCandidateStore((state) => state.candidates)
  const visitors = useVisitorStore((state) => state.visitors)
  const regions = useRegionStore((state) => state.regions)
  const deleteResult = useHomeVisitStore((state) => state.deleteResult)

  const [searchTerm, setSearchBar] = useState('')
  const [filterRegion, setFilterRegion] = useState('all')
  const [isStatsExpanded, setIsStatsExpanded] = useState(false)
  const [expandedVisitors, setExpandedVisitors] = useState<string[]>([])
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void}>({isOpen: false, title: '', message: '', onConfirm: () => {}})

  useEffect(() => {
    useHomeVisitStore.getState().loadFromAPI()
    useCandidateStore.getState().loadFromAPI()
    useVisitorStore.getState().loadFromAPI()
    useRegionStore.getState().loadFromAPI()
  }, [])

  const getCandidateName = (id: string) => {
    return candidates.find((c) => c.id === id)?.full_name || `Kandidat ${id}`
  }

  const getCandidateSchool = (id: string) => {
    return candidates.find((c) => c.id === id)?.campus || '-'
  }

  const getCandidateRegion = (id: string) => {
    return candidates.find((c) => c.id === id)?.region || '-'
  }

  const getCandidateGender = (id: string) => {
    return candidates.find((c) => c.id === id)?.gender || '-'
  }

  const getCandidateMajor = (id: string) => {
    return candidates.find((c) => c.id === id)?.major || '-'
  }

  const getVisitorName = (fasilId: string) => {
    return visitors.find(i => i.id === fasilId)?.name || '-'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getLikertScore = (r: any) => {
    if (!r) return 0
    return r.score || 0
  }

  // Filter logic
  const filteredResults = results.filter((result) => {
    const candidateName = getCandidateName(result.candidateId).toLowerCase()
    const fasilName = getVisitorName(result.fasilId).toLowerCase()
    const region = getCandidateRegion(result.candidateId)
    
    const matchesSearch = candidateName.includes(searchTerm.toLowerCase()) || 
                          fasilName.includes(searchTerm.toLowerCase())
    const matchesRegion = filterRegion === 'all' || region === filterRegion

    return matchesSearch && matchesRegion
  })

  // Global scorecard stats
  const totalCandidates = candidates.length
  const totalVisited = results.length

  // Calculate stats per region for collapse detail
  const regionStats = regions.map(reg => {
    const totalInReg = candidates.filter(c => c.region === reg.name).length
    const visitedInReg = results.filter(r => getCandidateRegion(r.candidateId) === reg.name).length
    return {
      name: reg.name,
      visited: visitedInReg,
      total: totalInReg
    }
  }).filter(stat => stat.total > 0)

  const handleExportExcel = () => {
    if (filteredResults.length === 0) return

    const dataToExport = [
      ['REKAPITULASI HASIL OBSERVASI HOME VISIT'],
      [`Filter Wilayah: ${filterRegion === 'all' ? 'Semua Wilayah' : filterRegion}`],
      [`Tanggal Export: ${new Date().toLocaleDateString('id-ID')}`],
      [],
      ['Nama Kandidat', 'Jenis Kelamin', 'Kampus', 'Prodi', 'Wilayah', 'Visitor', 'Skor (%)', 'Tanggal'],
      ...filteredResults.map((r) => [
        getCandidateName(r.candidateId),
        getCandidateGender(r.candidateId),
        getCandidateSchool(r.candidateId),
        getCandidateMajor(r.candidateId),
        getCandidateRegion(r.candidateId),
        getVisitorName(r.fasilId),
        getLikertScore(r).toFixed(1),
        formatDate(r.submittedAt),
      ]),
    ]

    const ws = XLSX.utils.aoa_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Hasil Home Visit')
    ws['!cols'] = [
      { wch: 30 }, // Nama Kandidat
      { wch: 15 }, // Jenis Kelamin
      { wch: 25 }, // Kampus
      { wch: 25 }, // Prodi
      { wch: 20 }, // Wilayah
      { wch: 25 }, // Visitor
      { wch: 15 }, // Skor (%)
      { wch: 20 }  // Tanggal
    ]
    XLSX.writeFile(wb, `Hasil_Home_Visit_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleDeleteItem = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Hasil Observasi',
      message: `Apakah Anda yakin ingin mereset/menghapus hasil observasi untuk kandidat "${name}"? Data akan dihapus secara permanen.`,
      onConfirm: async () => {
        await deleteResult(id)
        setConfirmModal(prev => ({...prev, isOpen: false}))
      }
    })
  }

  const toggleVisitorExpand = (fasilId: string) => {
    setExpandedVisitors(prev =>
      prev.includes(fasilId) ? prev.filter(id => id !== fasilId) : [...prev, fasilId]
    )
  }

  // Group filtered results by Visitor (fasilId) for mobile view
  const groupedByVisitor = filteredResults.reduce((acc, r) => {
    if (!acc[r.fasilId]) acc[r.fasilId] = []
    acc[r.fasilId].push(r)
    return acc
  }, {} as Record<string, typeof filteredResults>)

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Topbar */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin')}
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <h1 className="text-base font-extrabold text-slate-800">Hasil Home Visit</h1>
          </div>
          <button
            onClick={handleExportExcel}
            className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-all active:scale-90 shadow-sm text-sm"
            title="Export Excel"
          >
            📥
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Scorecard */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Kandidat di-Visit</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-800">{totalVisited}</span>
                <span className="text-slate-400 text-sm font-bold">/ {totalCandidates} Kandidat</span>
              </div>
            </div>
            <button
              onClick={() => setIsStatsExpanded(!isStatsExpanded)}
              className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 active:scale-90 transition-all border border-slate-100"
              title="Detail Wilayah"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className={`w-4 h-4 transform transition-transform duration-200 ${isStatsExpanded ? 'rotate-180' : ''}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>

          {/* Region Breakdown Collapse list */}
          {isStatsExpanded && (
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in duration-200">
              {regionStats.map(stat => (
                <div key={stat.name} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                  <p className="text-slate-400 font-bold truncate">{stat.name}</p>
                  <p className="font-extrabold text-slate-700 mt-1">
                    {stat.visited} <span className="text-[10px] text-slate-400 font-medium">/ {stat.total}</span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cari nama kandidat atau fasil..."
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
              value={searchTerm}
              onChange={(e) => setSearchBar(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <select
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold text-slate-700"
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
            >
              <option value="all">Semua Wilayah</option>
              {regions.map(r => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 💻 Desktop View (Table) */}
        <div className="hidden md:block bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Visitor</th>
                  <th className="px-6 py-4">Kandidat</th>
                  <th className="px-6 py-4">Wilayah</th>
                  <th className="px-6 py-4 text-center">Skor</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-xs text-slate-400 italic">
                      Tidak ada data hasil home visit yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((r) => {
                    const cName = getCandidateName(r.candidateId)
                    return (
                      <tr key={r.id} className="hover:bg-slate-50/55 transition-colors">
                        <td className="px-6 py-4 text-xs font-extrabold text-slate-800">
                          {getVisitorName(r.fasilId)}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-extrabold text-xs text-slate-800">{cName}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{getCandidateSchool(r.candidateId)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                            {getCandidateRegion(r.candidateId)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-extrabold text-xs text-emerald-600">
                            {getLikertScore(r).toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-1.5 justify-end">
                            <button
                              onClick={() => navigate(`/admin/hasil-home-visit-detail/${r.id}`)}
                              className="w-8 h-8 rounded-lg bg-white border border-slate-150 flex items-center justify-center text-xs hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 active:scale-90 transition-all shadow-sm"
                              title="Lihat Detail / Edit"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteItem(r.id, cName)}
                              className="w-8 h-8 rounded-lg bg-white border border-slate-150 flex items-center justify-center text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-100 active:scale-90 transition-all shadow-sm"
                              title="Reset Data"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 📱 Mobile View (Card per Visitor with collapse) */}
        <div className="block md:hidden space-y-4">
          {Object.keys(groupedByVisitor).length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center shadow-sm">
              <p className="text-xs text-slate-400 italic">Tidak ada data hasil home visit.</p>
            </div>
          ) : (
            Object.entries(groupedByVisitor).map(([fasilId, visitorResults]) => {
              const visitorName = getVisitorName(fasilId)
              const isExpanded = expandedVisitors.includes(fasilId)
              const count = visitorResults.length

              return (
                <div key={fasilId} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  {/* Visitor Card Header */}
                  <div
                    onClick={() => toggleVisitorExpand(fasilId)}
                    className="p-4 bg-slate-50 flex justify-between items-center cursor-pointer hover:bg-slate-100/60 active:bg-slate-100 transition-all"
                  >
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-800">{visitorName}</h3>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">{count} Kandidat di-Visit</p>
                    </div>
                    <button className="w-7 h-7 rounded-full bg-white flex items-center justify-center border border-slate-150 text-slate-500 shadow-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        className={`w-3.5 h-3.5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                  </div>

                  {/* Visitor Candidates detail collapse */}
                  {isExpanded && (
                    <div className="p-4 divide-y divide-slate-100 space-y-3.5 animate-in fade-in duration-200">
                      {visitorResults.map((r) => {
                        const cName = getCandidateName(r.candidateId)
                        return (
                          <div key={r.id} className="pt-3.5 first:pt-0 flex justify-between items-center text-xs">
                            <div className="space-y-1">
                              <span className="font-extrabold text-slate-800 block">{cName}</span>
                              <span className="text-[9px] text-slate-400 font-bold block">{getCandidateSchool(r.candidateId)}</span>
                              <div className="flex gap-1.5 pt-0.5">
                                <span className="bg-slate-100 text-slate-600 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                                  {getCandidateRegion(r.candidateId)}
                                </span>
                                <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100/50">
                                  Skor: {getLikertScore(r).toFixed(1)}%
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-1.5 shrink-0 ml-3">
                              <button
                                onClick={() => navigate(`/admin/hasil-home-visit-detail/${r.id}`)}
                                className="w-8 h-8 rounded-lg bg-white border border-slate-150 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm"
                                title="Edit / Detail"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteItem(r.id, cName)}
                                className="w-8 h-8 rounded-lg bg-white border border-slate-150 flex items-center justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
                                title="Hapus"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant="danger"
        confirmLabel="Ya, Hapus"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({...prev, isOpen: false}))}
      />
    </div>
  )
}



