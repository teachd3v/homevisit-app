import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useScheduleStore, Schedule } from '../../store/scheduleStore'
import { useRegionStore } from '../../store/regionStore'
import { useCandidateStore } from '../../store/candidateStore'
import { useVisitorStore } from '../../store/visitorStore'

import ConfirmModal from '../../components/ConfirmModal'


export default function JadwalHomeVisit() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingVisitorId, setEditingVisitorId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [expandedIds, setExpandedIds] = useState<string[]>([])
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('')
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void}>({isOpen: false, title: '', message: '', onConfirm: () => {}})

  // Form state
  const [formData, setFormData] = useState({
    etoserId: '', // Selected Visitor ID
    selectedCandidates: [] as string[],
  })
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})

  const allSchedules = useScheduleStore((state) => state.schedules)
  
  const bulkAddSchedules = useScheduleStore((state) => state.bulkAddSchedules)
  const deleteSchedule = useScheduleStore((state) => state.deleteSchedule)

  const candidates = useCandidateStore((state) => state.candidates)
  const visitors = useVisitorStore((state) => state.visitors)
  const regions = useRegionStore((state) => state.regions)

  useEffect(() => {
    useRegionStore.getState().loadFromAPI()
    useCandidateStore.getState().loadFromAPI()
    useScheduleStore.getState().loadFromAPI()
    useVisitorStore.getState().loadFromAPI()
  }, [])

  // Group schedules by visitor
  const groupedSchedules = Object.values(
    allSchedules.reduce((acc, sch) => {
      if (!acc[sch.visitorId]) acc[sch.visitorId] = { visitorId: sch.visitorId, schedules: [] }
      acc[sch.visitorId].schedules.push(sch)
      return acc
    }, {} as Record<string, { visitorId: string, schedules: Schedule[] }>)
  )

  const handleAddSchedule = () => {
    setFormData({
      etoserId: '',
      selectedCandidates: [],
    })
    setFormErrors({})
    setSelectedRegionFilter('')
    setShowCreateModal(true)
  }

  const handleEditSchedule = (group: { visitorId: string, schedules: Schedule[] }) => {
    setEditingVisitorId(group.visitorId)
    setFormData({
      etoserId: group.visitorId,
      selectedCandidates: group.schedules.map(s => s.candidateId),
    })
    setFormErrors({})
    setSelectedRegionFilter('')
    setShowEditModal(true)
  }

  const closeModal = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setEditingVisitorId(null)
    setFormData({
      etoserId: '',
      selectedCandidates: [],
    })
    setFormErrors({})
    setSelectedRegionFilter('')
  }

  const validateForm = () => {
    const errors: { [key: string]: string } = {}
    if (!formData.etoserId) errors.etoserId = 'Visitor harus dipilih'
    if (formData.selectedCandidates.length === 0) errors.candidates = 'Minimal 1 kandidat harus dipilih'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleFormSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const visitorId = formData.etoserId
      
      // Get existing schedules for this visitor
      const existingSchedules = allSchedules.filter(s => s.visitorId === visitorId)
      
      // Find which to add and which to delete
      const existingCandidateIds = existingSchedules.map(s => s.candidateId)
      const toAdd = formData.selectedCandidates.filter(cId => !existingCandidateIds.includes(cId))
      const toDelete = existingSchedules.filter(s => !formData.selectedCandidates.includes(s.candidateId))

      // Delete removed candidates
      for (const s of toDelete) {
        await deleteSchedule(s.id)
      }

      // Add new candidates
      if (toAdd.length > 0) {
        const newSchedules = toAdd.map(cId => ({
          candidateId: cId,
          visitorId: visitorId,
          schedule_date: new Date().toISOString().split('T')[0],
          status: 'scheduled',
        }))
        await bulkAddSchedules(newSchedules)
      }

      setToast({ message: 'Penugasan berhasil disimpan', type: 'success' })
      closeModal()
    } catch (error) {
      setToast({ message: `Error: ${(error as Error).message}`, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCandidateToggle = (candidateId: string): void => {
    setFormData((prev) => ({
      ...prev,
      selectedCandidates: prev.selectedCandidates.includes(candidateId)
        ? prev.selectedCandidates.filter((id) => id !== candidateId)
        : [...prev.selectedCandidates, candidateId],
    }))
  }

  const getVisitorName = (id: string | undefined) => {
    if (!id) return 'Belum ditentukan'
    const v = visitors.find((i) => i.id === id)
    return v?.name || v?.full_name || `Visitor ${id}`
  }

  const getVisitorRole = (id: string | undefined) => {
    if (!id) return '-'
    const role = visitors.find((i) => i.id === id)?.role
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : '-'
  }

  const getCandidateName = (id: string) => {
    return candidates.find((c) => c.id === id)?.full_name || `Kandidat ${id}`
  }

  const toggleExpand = (id: string) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/admin" className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Jadwal Home Visit</h1>
          <button
            onClick={handleAddSchedule}
            className="bg-emerald-600 hover:bg-emerald-700 text-white w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center transition-colors font-bold text-lg md:text-xl shrink-0"
          >
            +
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-20 right-6 p-4 rounded-lg text-white z-50 ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Table & Cards */}
        {groupedSchedules.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">Belum ada penugasan observasi visitor ke kandidat.</p>
            <button
              onClick={handleAddSchedule}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg"
            >
              Tambah Penugasan Pertama
            </button>
          </div>
        ) : (
          <>
            {/* Desktop View Table */}
            <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nama Visitor</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Peran</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Kandidat Observasi</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 w-32">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedSchedules.map((group) => {
                    const visitorId = group.visitorId
                    return (
                      <tr key={visitorId} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{getVisitorName(visitorId)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
                            {getVisitorRole(visitorId)}
                          </span>
                        </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex flex-wrap gap-1.5">
                          {group.schedules.map((sch) => (
                            <span key={sch.id} className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-medium">
                              👤 {getCandidateName(sch.candidateId)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEditSchedule(group)}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: 'Hapus Penugasan',
                                message: 'Apakah Anda yakin ingin menghapus seluruh penugasan visitor ini? Data akan dihapus secara permanen.',
                                onConfirm: async () => {
                                  for (const s of group.schedules) {
                                    await deleteSchedule(s.id)
                                  }
                                  setConfirmModal(prev => ({...prev, isOpen: false}))
                                  setToast({ message: 'Penugasan berhasil dihapus', type: 'success' })
                                  setTimeout(() => {
                                    setToast(null)
                                  }, 1000)
                                }
                              })
                            }}
                            className="text-red-600 hover:text-red-700 font-medium text-sm"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View Cascading Cards */}
            <div className="block md:hidden space-y-4">
              {groupedSchedules.map((group) => {
                const isExpanded = expandedIds.includes(group.visitorId)
                const cCount = group.schedules.length
                const visitorId = group.visitorId
                return (
                  <div key={visitorId} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-2">
                        <p className="font-bold text-slate-800 text-base">
                          {getVisitorName(visitorId)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                            {getVisitorRole(visitorId)}
                          </span>
                          <span>• {cCount} Kandidat</span>
                        </p>
                      </div>
                      <button
                        onClick={() => toggleExpand(visitorId)}
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
                      <div className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in-50 duration-200">
                        <div className="text-xs text-slate-600">
                          <span className="text-slate-400 block mb-1.5">Kandidat Observasi:</span>
                          <div className="space-y-1.5">
                            {group.schedules.map((sch) => (
                              <div key={sch.id} className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-2.5 py-1.5 rounded-lg border border-emerald-100 text-xs font-semibold">
                                👤 {getCandidateName(sch.candidateId)}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            onClick={() => handleEditSchedule(group)}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: 'Hapus Penugasan',
                                message: 'Apakah Anda yakin ingin menghapus seluruh penugasan ini? Data akan dihapus secara permanen.',
                                onConfirm: async () => {
                                  for (const s of group.schedules) {
                                    await deleteSchedule(s.id)
                                  }
                                  setConfirmModal(prev => ({...prev, isOpen: false}))
                                  setToast({ message: 'Penugasan berhasil dihapus', type: 'success' })
                                  setTimeout(() => {
                                    setToast(null)
                                  }, 1000)
                                }
                              })
                            }}
                            className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Create/Edit Assignment Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 p-6 flex justify-between items-center bg-white sticky top-0 rounded-t-lg">
              <h2 className="text-xl font-bold text-gray-900">
                {showEditModal ? 'Edit Penugasan Visitor' : 'Tambah Penugasan Visitor'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 font-bold text-xl"
              >
                ?
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* Visitor Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Pilih Visitor <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.etoserId}
                  onChange={(e) => setFormData({ ...formData, etoserId: e.target.value })}
                  disabled={showEditModal}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                    formErrors.etoserId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">-- Pilih Visitor --</option>
                  {visitors.map((visitor) => (
                    <option key={visitor.id} value={visitor.id}>
                      {visitor.name || visitor.full_name} ({visitor.role.toUpperCase()})
                    </option>
                  ))}
                </select>
                {formErrors.etoserId && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.etoserId}</p>
                )}
              </div>

              {/* Filter Wilayah Kandidat */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Filter Wilayah Kandidat
                </label>
                <select
                  value={selectedRegionFilter}
                  onChange={(e) => setSelectedRegionFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                >
                  <option value="">-- Semua Wilayah --</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.name}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Candidates Checklist */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Pilih Kandidat Observasi <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto space-y-2">
                  {candidates.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">Belum ada kandidat tersedia</p>
                  ) : (() => {
                    const assignedCandidateIds = new Set<string>()
                    allSchedules.forEach((sch) => {
                      if (showEditModal && editingVisitorId === sch.visitorId) return
                      assignedCandidateIds.add(sch.candidateId)
                    })

                    const filtered = candidates.filter(c => {
                      const matchesRegion = !selectedRegionFilter || (c.region || '').toLowerCase() === selectedRegionFilter.toLowerCase()
                      const notAssignedToOthers = !assignedCandidateIds.has(c.id)
                      return matchesRegion && notAssignedToOthers
                    })
                    
                    if (filtered.length === 0) {
                      return <p className="text-gray-500 text-sm italic">Tidak ada kandidat tersedia (belum ditugaskan)</p>;
                    }

                    return filtered.map((candidate) => (
                      <div key={candidate.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`cand-${candidate.id}`}
                          checked={formData.selectedCandidates.includes(candidate.id)}
                          onChange={() => handleCandidateToggle(candidate.id)}
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                        />
                        <label
                          htmlFor={`cand-${candidate.id}`}
                          className="ml-3 flex-1 cursor-pointer text-sm text-gray-900"
                        >
                          {candidate.full_name}
                          <span className="text-gray-500 text-xs ml-1.5">({candidate.campus} • {candidate.region})</span>
                        </label>
                      </div>
                    ));
                  })()}
                </div>
                {formErrors.candidates && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.candidates}</p>
                )}
                {formData.selectedCandidates.length > 0 && (
                  <p className="text-emerald-600 text-xs mt-2 font-semibold">
                    {formData.selectedCandidates.length} kandidat terpilih (total)
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 p-6 flex gap-3 justify-end bg-gray-50 rounded-b-lg">
              <button
                onClick={closeModal}
                disabled={isLoading}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleFormSubmit}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold"
              >
                {isLoading ? 'Menyimpan...' : showEditModal ? 'Perbarui' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

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


