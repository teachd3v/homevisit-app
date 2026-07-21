import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCandidates, useDeleteCandidate, useUpdateCandidate, useAddCandidate, useUpdatePantukhirStatus, useUpdateHomeVisitStatus, useBulkUpdateHomeVisitStatus, useBulkAddCandidates } from '../../hooks/useCandidates'
import { useFormResultsStore } from '../../store/formResultsStore'
import { useRegions, useCampuses, useAddRegion, useDeleteRegion, useUpdateRegion, useAddCampus, useDeleteCampus, useUpdateCampus } from '../../hooks/useRegions'
import ConfirmModal from '../../components/ConfirmModal'

export default function ValidasiHomeVisit() {
  const navigate = useNavigate()
  const { data: candidates = [] } = useCandidates()
  const results = useFormResultsStore((state) => state.results)
  const { data: regions = [] } = useRegions()
  
  const { mutateAsync: updateStatus } = useUpdateHomeVisitStatus()
  const { mutateAsync: bulkUpdateStatus } = useBulkUpdateHomeVisitStatus()

  const [searchTerm, setSearchBar] = useState('')
  const [filterRegion, setFilterRegion] = useState('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, variant: 'danger'|'warning'|'info', confirmLabel: string, onConfirm: () => void}>({isOpen: false, title: '', message: '', variant: 'info', confirmLabel: '', onConfirm: () => {}})

  useEffect(() => {
    
    useFormResultsStore.getState().loadFromAPI()
    
  }, [])

  // Filter kandidat yang sudah 3x interview (atau 2x untuk Pidie Jaya) dan lulus Part A
  const eligibleCandidates = candidates.filter(c => {
    const candResults = results.filter(r => r.candidateId === c.id)
    const requiredResults = c.region === 'PIDIE JAYA' ? 2 : 3
    
    if (candResults.length !== requiredResults) return false
    const passInitial = candResults.every(r => r.partAPass)
    if (!passInitial) return false
    
    // Filter berdasarkan input user
    const matchesSearch = c.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRegion = filterRegion === 'all' || c.region === filterRegion
    
    return matchesSearch && matchesRegion
  }).map(c => {
    const candResults = results.filter(r => r.candidateId === c.id)
    const avgScore = candResults.reduce((sum, r) => sum + r.partBPercentage, 0) / candResults.length
    return { ...c, avgScore }
  }).sort((a, b) => b.avgScore - a.avgScore)

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === eligibleCandidates.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(eligibleCandidates.map(c => c.id))
    }
  }

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return
    setConfirmModal({
      isOpen: true,
      title: 'Loloskan Kandidat',
      message: `Apakah Anda yakin ingin meloloskan ${selectedIds.length} kandidat terpilih ke tahap Home Visit?`,
      variant: 'info',
      confirmLabel: 'Ya, Loloskan',
      onConfirm: async () => {
        await bulkUpdateStatus({ids: selectedIds, status: 'lolos'})
        setSelectedIds([])
        setConfirmModal(prev => ({ ...prev, isOpen: false }))
      }
    })
  }

  const handleBulkReject = () => {
    if (selectedIds.length === 0) return
    setConfirmModal({
      isOpen: true,
      title: 'Gugurkan Kandidat',
      message: `Apakah Anda yakin ingin menggugurkan ${selectedIds.length} kandidat terpilih?`,
      variant: 'danger',
      confirmLabel: 'Ya, Gugurkan',
      onConfirm: async () => {
        await bulkUpdateStatus({ids: selectedIds, status: 'gagal'})
        setSelectedIds([])
        setConfirmModal(prev => ({ ...prev, isOpen: false }))
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin')}
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">⚖️ Validasi Home Visit</h1>
              <p className="text-sm text-gray-600 mt-1">Tentukan kandidat yang layak lanjut ke observasi lapangan</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-blue-600 text-white p-4 rounded-xl shadow-lg mb-6 flex justify-between items-center animate-in slide-in-from-top-4">
            <p className="font-bold">{selectedIds.length} Kandidat Terpilih</p>
            <div className="flex gap-3">
              <button
                onClick={handleBulkReject}
                className="bg-red-500 hover:bg-red-400 px-4 py-2 rounded-lg text-sm font-black transition-colors"
              >
                ❌ GUGURKAN
              </button>
              <button
                onClick={handleBulkApprove}
                className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-black transition-colors"
              >
                ✅ LOLOSKAN KE HOME VISIT
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cari nama kandidat..."
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchBar(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <select
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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

        {/* Results Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4 w-10">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                      checked={selectedIds.length === eligibleCandidates.length && eligibleCandidates.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-4">Kandidat</th>
                  <th className="px-6 py-4">Wilayah</th>
                  <th className="px-6 py-4 text-center">Avg Skor (%)</th>
                  <th className="px-6 py-4">Status Saat Ini</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {eligibleCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Tidak ada kandidat baru yang memenuhi kualifikasi untuk divalidasi.
                    </td>
                  </tr>
                ) : (
                  eligibleCandidates.map((c) => (
                    <tr key={c.id} className={`transition-colors ${selectedIds.includes(c.id) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                          checked={selectedIds.includes(c.id)}
                          onChange={() => toggleSelect(c.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{c.full_name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{c.campus}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          {c.region}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {c.avgScore.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          c.home_visit_status === 'lolos' ? 'bg-green-100 text-green-700' :
                          c.home_visit_status === 'gagal' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {c.home_visit_status === 'lolos' ? '✓ SIAP VISIT' :
                           c.home_visit_status === 'gagal' ? '✗ GAGAL' :
                           '⏱️ PENDING'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => updateStatus({id: c.id, status: 'gagal'})}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Gugurkan"
                          >
                            <span className="text-xl">✗</span>
                          </button>
                          <button
                            onClick={() => updateStatus({id: c.id, status: 'lolos'})}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Loloskan ke Home Visit"
                          >
                            <span className="text-xl">✓</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmLabel={confirmModal.confirmLabel}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}
