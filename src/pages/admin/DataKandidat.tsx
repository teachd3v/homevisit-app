import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCandidateStore } from '../../store/candidateStore'
import { useRegionStore } from '../../store/regionStore'

import ConfirmModal from '../../components/ConfirmModal'

const formatRupiah = (value: string) => {
  const numericString = value.replace(/[^0-9]/g, '')
  if (!numericString) return ''
  return 'Rp ' + parseInt(numericString, 10).toLocaleString('id-ID')
}

export default function DataKandidat() {
  const [filterRegion, setFilterRegion] = useState('')

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedIds, setExpandedIds] = useState<string[]>([])
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void}>({isOpen: false, title: '', message: '', onConfirm: () => {}})

  const candidates = useCandidateStore((state) => state.candidates)
  const deleteCandidate = useCandidateStore((state) => state.deleteCandidate)
  const updateCandidate = useCandidateStore((state) => state.updateCandidate)
  const addCandidate = useCandidateStore((state) => state.addCandidate)


  const toggleExpand = (id: string) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  useEffect(() => {
    useCandidateStore.getState().loadFromAPI()
    useRegionStore.getState().loadFromAPI()
  }, [])

  const filteredCandidates = (filterRegion
    ? candidates.filter((c) => c.region === filterRegion)
    : candidates
  ).sort((a, b) => a.id.localeCompare(b.id))

  const regions = [...new Set(candidates.map((c) => c.region))]

  // Group candidates by region for mobile view
  const candidatesByRegion = filteredCandidates.reduce((acc, candidate) => {
    const region = candidate.region || 'Lainnya'
    if (!acc[region]) acc[region] = []
    acc[region].push(candidate)
    return acc
  }, {} as Record<string, typeof filteredCandidates>)



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 md:px-6 md:py-4 flex justify-between items-center">
          <Link to="/admin" className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900">Data Kandidat</h1>
          <button
            onClick={() => setShowAddForm(true)}
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
        {/* Filter & Summary */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter Wilayah</label>
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Wilayah</option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          <p className="text-sm font-medium text-gray-700">
            Showing {filteredCandidates.length} / {candidates.length} kandidat
          </p>
        </div>

        {/* Table */}
        {candidates.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg">Belum ada data kandidat. Upload file Excel terlebih dahulu.</p>
          </div>
        ) : (
          <>
            {/* Desktop View Table */}
            <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nama</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Jenis Kelamin
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Wilayah
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Kampus</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Prodi</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">UKT</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.map((candidate) => (
                    <tr key={candidate.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{candidate.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {candidate.full_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{candidate.gender}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{candidate.region}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{candidate.campus}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{candidate.major}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">{candidate.ukt || '-'}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => setEditingId(candidate.id)}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: 'Hapus Kandidat',
                                message: `Apakah Anda yakin ingin menghapus kandidat ${candidate.full_name}? Semua data home_visit dan jadwal terkait juga akan dihapus.`,
                                onConfirm: async () => {
                                  await deleteCandidate(candidate.id)
                                  setConfirmModal(prev => ({...prev, isOpen: false}))
                                  setToast({ message: 'Kandidat berhasil dihapus', type: 'success' })
                                  setTimeout(() => setToast(null), 3000)
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View Cascading Cards */}
            <div className="block md:hidden space-y-6">
              {Object.entries(candidatesByRegion).map(([regionName, regionCandidates]) => (
                <div key={regionName} className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 inline-block">
                    📍 {regionName} ({regionCandidates.length})
                  </h3>
                  <div className="space-y-3">
                    {regionCandidates.map((candidate) => {
                      const isExpanded = expandedIds.includes(candidate.id)
                      return (
                        <div key={candidate.id} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 pr-2">
                              <p className="font-bold text-slate-800 text-base">{candidate.full_name}</p>
                              <p className="text-xs text-slate-500 mt-0.5 font-medium">🏫 {candidate.campus}</p>
                            </div>
                            <button
                              onClick={() => toggleExpand(candidate.id)}
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
                              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                                <div>
                                  <span className="text-slate-400 block">ID Kandidat</span>
                                  <span className="font-semibold text-slate-700">{candidate.id}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block">Jenis Kelamin</span>
                                  <span className="font-semibold text-slate-700">{candidate.gender}</span>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-slate-400 block">Program Studi (Prodi)</span>
                                  <span className="font-semibold text-slate-700">{candidate.major}</span>
                                </div>
                                <div className="col-span-2">
                                  <span className="text-slate-400 block">UKT</span>
                                  <span className="font-semibold text-slate-700">{candidate.ukt || '-'}</span>
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end pt-2">
                                <button
                                  onClick={() => setEditingId(candidate.id)}
                                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => {
                                    setConfirmModal({
                                      isOpen: true,
                                      title: 'Hapus Kandidat',
                                      message: `Apakah Anda yakin ingin menghapus kandidat ${candidate.full_name}? Semua data home_visit dan jadwal terkait juga akan dihapus.`,
                                      onConfirm: async () => {
                                        await deleteCandidate(candidate.id)
                                        setConfirmModal(prev => ({...prev, isOpen: false}))
                                        setToast({ message: 'Kandidat berhasil dihapus', type: 'success' })
                                        setTimeout(() => setToast(null), 3000)
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
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <EditCandidateModal
          candidate={candidates.find((c) => c.id === editingId)!}
          onClose={() => setEditingId(null)}
          onUpdate={async (id, updates) => {
            await updateCandidate(id, updates)
            setToast({ message: 'Data kandidat berhasil diperbarui', type: 'success' })
            setTimeout(() => setToast(null), 3000)
          }}
        />
      )}

      {/* Add Modal */}
      {showAddForm && (() => {
        const suggestedId = (() => {
          const numericIds = candidates
            .map((c) => parseInt(c.id, 10))
            .filter((num) => !isNaN(num))
          const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0
          return String(maxId + 1).padStart(3, '0')
        })()

        return (
          <AddCandidateModal
            onClose={() => setShowAddForm(false)}
            suggestedId={suggestedId}
            onAdd={async (cData) => {
              await addCandidate(cData)
              setToast({ message: 'Kandidat baru berhasil ditambahkan', type: 'success' })
              setTimeout(() => setToast(null), 3000)
            }}
          />
        )
      })()}

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

interface EditCandidateModalProps {
  candidate: any
  onClose: () => void
  onUpdate: (id: string, updates: any) => Promise<void>
}

function EditCandidateModal({ candidate, onClose, onUpdate }: EditCandidateModalProps) {
  const [full_name, setFull_name] = useState(candidate.full_name)
  const [campus, setSchool] = useState(candidate.campus)
  const [region, setRegion] = useState(candidate.region)
  const [gender, setGender] = useState(candidate.gender || '')
  const [major, setMajor] = useState(candidate.major || '')
  const [ukt, setUkt] = useState(candidate.ukt || '')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!full_name || !campus || !region || !gender || !major) {
      alert('Harap isi nama, kampus, wilayah, jenis kelamin, dan prodi')
      return
    }

    setIsLoading(true)
    try {
      await onUpdate(candidate.id, {
        full_name,
        campus,
        region,
        gender,
        major,
        ukt,
      })
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Kandidat</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
            <input
              type="text"
              value={full_name}
              onChange={(e) => setFull_name(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wilayah</label>
            <select
              value={region}
              onChange={(e) => {
                setRegion(e.target.value)
                setSchool('') // Reset campus when region changes
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
            >
              <option value="">Pilih Wilayah</option>
              {useRegionStore.getState().regions.map((r) => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kampus</label>
            <select
              value={campus}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
              disabled={!region}
            >
              <option value="">{region ? 'Pilih Kampus' : 'Pilih Wilayah Terlebih Dahulu'}</option>
              {(() => {
                const regObj = useRegionStore.getState().regions.find(r => r.name === region)
                const filtered = regObj
                  ? useRegionStore.getState().campuses.filter(s => s.regionId === regObj.id)
                  : []
                return filtered.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))
              })()}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prodi</label>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">UKT</label>
            <input
              type="text"
              value={ukt}
              onChange={(e) => setUkt(formatRupiah(e.target.value))}
              placeholder="Contoh: Rp 1.500.000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 font-medium rounded-lg disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
          >
            {isLoading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface AddCandidateModalProps {
  onClose: () => void
  onAdd: (candidate: any) => Promise<void>
  suggestedId: string
}

function AddCandidateModal({ onClose, onAdd, suggestedId }: AddCandidateModalProps) {
  const [id, setId] = useState(suggestedId)
  const [full_name, setFull_name] = useState('')
  const [campus, setSchool] = useState('')
  const [region, setRegion] = useState('')
  const [gender, setGender] = useState('')
  const [major, setMajor] = useState('')
  const [ukt, setUkt] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!id || !full_name || !campus || !region || !gender || !major) {
      alert('Harap isi ID, nama, kampus, wilayah, jenis kelamin, dan prodi')
      return
    }

    setIsLoading(true)
    try {
      await onAdd({
        id,
        full_name,
        campus,
        region,
        gender,
        major,
        ukt,
      })
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tambah Kandidat Baru</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Kandidat</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Contoh: 001"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
            <input
              type="text"
              value={full_name}
              onChange={(e) => setFull_name(e.target.value)}
              placeholder="Nama lengkap"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wilayah</label>
            <select
              value={region}
              onChange={(e) => {
                setRegion(e.target.value)
                setSchool('') // Reset campus when region changes
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
            >
              <option value="">Pilih Wilayah</option>
              {useRegionStore.getState().regions.map((r) => (
                <option key={r.id} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kampus</label>
            <select
              value={campus}
              onChange={(e) => setSchool(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
              disabled={!region}
            >
              <option value="">{region ? 'Pilih Kampus' : 'Pilih Wilayah Terlebih Dahulu'}</option>
              {(() => {
                const regObj = useRegionStore.getState().regions.find(r => r.name === region)
                const filtered = regObj
                  ? useRegionStore.getState().campuses.filter(s => s.regionId === regObj.id)
                  : []
                return filtered.map((s) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))
              })()}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prodi</label>
            <input
              type="text"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="Program Studi"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">UKT</label>
            <input
              type="text"
              value={ukt}
              onChange={(e) => setUkt(formatRupiah(e.target.value))}
              placeholder="Contoh: Rp 1.500.000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 font-medium rounded-lg disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50"
          >
            {isLoading ? 'Menambah...' : 'Tambah'}
          </button>
        </div>
      </div>
    </div>
  )
}

