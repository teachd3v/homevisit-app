import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useRegionStore } from '../../store/regionStore'
import ConfirmModal from '../../components/ConfirmModal'

export default function DataWilayah() {
  const {
    regions,
    campuses,
    loadFromAPI,
    addRegion,
    deleteRegion,
    
    addCampus,
    deleteCampus,
    updateCampus
  } = useRegionStore()

  // Modals & Menu State
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [showAddRegionModal, setShowAddRegionModal] = useState(false)
  const [showaddCampusModal, setShowaddCampusModal] = useState(false)
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null)

  // Form states
  const [regionName, setRegionName] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [selectedRegionId, setSelectedRegionId] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const menuRef = useRef<HTMLDivElement>(null)
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, variant: 'danger'|'warning'|'info', confirmLabel: string, onConfirm: () => void}>({isOpen: false, title: '', message: '', variant: 'danger', confirmLabel: '', onConfirm: () => {}})

  useEffect(() => {
    loadFromAPI()

    // Click outside handler for floating add menu
    const clickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAddMenu(false)
      }
    }
    document.addEventListener('mousedown', clickOutside)
    return () => document.removeEventListener('mousedown', clickOutside)
  }, [])

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSaveRegion = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = regionName.trim()
    if (!trimmed) return

    const exists = regions.some((r) => r.name.toLowerCase().trim() === trimmed.toLowerCase())
    if (exists) {
      alert(`Wilayah "${trimmed}" sudah terdaftar!`)
      return
    }

    await addRegion(trimmed)
    triggerToast('Wilayah tugas berhasil ditambahkan')
    setRegionName('')
    setShowAddRegionModal(false)
  }

  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedSchool = schoolName.trim()
    if (!trimmedSchool || !selectedRegionId) {
      alert('Harap pilih Wilayah Tugas dan isi nama kampus!')
      return
    }

    const exists = campuses.some(
      (s) => s.name.toLowerCase().trim() === trimmedSchool.toLowerCase() && s.regionId === selectedRegionId
    )
    if (exists) {
      alert(`Kampus "${trimmedSchool}" sudah terdaftar di wilayah tugas ini!`)
      return
    }

    await addCampus(trimmedSchool, selectedRegionId)
    triggerToast('Kampus berhasil ditambahkan')
    setSchoolName('')
    setSelectedRegionId('')
    setShowaddCampusModal(false)
  }

  const handleSaveEditSchool = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedSchool = schoolName.trim()
    if (!editingSchoolId || !trimmedSchool || !selectedRegionId) return

    const exists = campuses.some(
      (s) => s.id !== editingSchoolId && s.name.toLowerCase().trim() === trimmedSchool.toLowerCase() && s.regionId === selectedRegionId
    )
    if (exists) {
      alert(`Kampus "${trimmedSchool}" sudah terdaftar di wilayah tugas ini!`)
      return
    }

    await updateCampus(editingSchoolId, trimmedSchool, selectedRegionId)
    triggerToast('Data kampus berhasil diperbarui')
    setSchoolName('')
    setSelectedRegionId('')
    setEditingSchoolId(null)
  }

  const handledeleteCampusItem = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Kampus',
      message: `Apakah Anda yakin ingin menghapus kampus "${name}"? Data akan dihapus secara permanen.`,
      variant: 'danger',
      confirmLabel: 'Ya, Hapus',
      onConfirm: async () => {
        await deleteCampus(id)
        setConfirmModal(prev => ({...prev, isOpen: false}))
        triggerToast('Kampus berhasil dihapus')
      }
    })
  }

  const handleDeleteRegionItem = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Wilayah',
      message: `Apakah Anda yakin ingin menghapus wilayah "${name}"?\nMenghapus wilayah ini juga akan otomatis menghapus seluruh daftar kampus yang terikat di dalamnya.`,
      variant: 'warning',
      confirmLabel: 'Ya, Hapus Wilayah',
      onConfirm: async () => {
        await deleteRegion(id)
        setConfirmModal(prev => ({...prev, isOpen: false}))
        triggerToast('Wilayah tugas dan kampus terkait berhasil dihapus')
      }
    })
  }

  const openEditModal = (schoolId: string, currentName: string, currentRegId: string) => {
    setEditingSchoolId(schoolId)
    setSchoolName(currentName)
    setSelectedRegionId(currentRegId)
  }

  const getRegionName = (regId: string) => regions.find(r => r.id === regId)?.name || 'Lainnya'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between pb-12">
      {/* Topbar */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center relative">
          <Link
            to="/admin"
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="text-base font-extrabold text-slate-800">Data Wilayah & Kampus</h1>
          
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90 font-extrabold text-xl shadow-md shadow-emerald-500/10"
            >
              +
            </button>

            {/* Dropdown Menu */}
            {showAddMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-2 animate-in fade-in-50 slide-in-from-top-3 duration-200">
                <button
                  onClick={() => {
                    setShowAddRegionModal(true)
                    setShowAddMenu(false)
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all"
                >
                  📍 Tambah Wilayah Tugas
                </button>
                <button
                  onClick={() => {
                    setShowaddCampusModal(true)
                    setShowAddMenu(false)
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all"
                >
                  🎓 Tambah Kampus Baru
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900 text-white font-bold py-2 px-5 rounded-full shadow-lg text-xs animate-bounce">
          {toast.message}
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto w-full px-4 mt-6 flex-1">
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
              🎓 Daftar Kampus Terdaftar
            </h2>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {campuses.length} Kampus
            </span>
          </div>

          {campuses.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <span className="text-4xl block">🎓</span>
              <p className="text-xs text-slate-400 font-bold">Belum ada data kampus terdaftar.</p>
              <p className="text-[10px] text-slate-400">Silakan klik tombol + untuk menambahkan Wilayah dan Kampus baru.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campuses.map((campus) => {
                const regionName = getRegionName(campus.regionId || "")
                return (
                  <div
                    key={campus.id}
                    className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between hover:shadow-sm hover:border-slate-200 transition-all"
                  >
                    <div className="space-y-1">
                      <h3 className="text-xs font-extrabold text-slate-800 leading-tight">
                        {campus.name}
                      </h3>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                        <span>📍</span>
                        <span>{regionName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-3">
                      <button
                        onClick={() => openEditModal(campus.id, campus.name, campus.regionId || "")}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-150 flex items-center justify-center text-xs hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 active:scale-90 transition-all shadow-sm"
                        title="Edit Kampus"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handledeleteCampusItem(campus.id, campus.name)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-150 flex items-center justify-center text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-100 active:scale-90 transition-all shadow-sm"
                        title="Hapus Kampus"
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
      </div>

      {/* 1. Modal Tambah Wilayah Tugas */}
      {showAddRegionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in-50 duration-200">
          <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              📍 Tambah Wilayah Tugas Baru
            </h3>
            <form onSubmit={handleSaveRegion} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Nama Wilayah</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: DKI Jakarta, Jawa Barat"
                  value={regionName}
                  onChange={(e) => setRegionName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-bold text-slate-700"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddRegionModal(false)
                    setRegionName('')
                  }}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs hover:bg-slate-50 active:scale-95 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-500/10"
                >
                  Simpan Wilayah
                </button>
              </div>
            </form>

            {/* List of current regions inside the region modal */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Wilayah Terdaftar ({regions.length})</h4>
              {regions.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic">Belum ada wilayah.</p>
              ) : (
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {regions.map((reg) => (
                    <div key={reg.id} className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100 text-xs">
                      <span className="font-bold text-slate-700">{reg.name}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteRegionItem(reg.id, reg.name)}
                        className="text-red-500 hover:text-red-750 font-bold px-2 py-0.5 text-[11px] hover:bg-red-50 rounded-lg active:scale-95 transition-all"
                        title="Hapus Wilayah"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Tambah Kampus Baru */}
      {showaddCampusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in-50 duration-200">
          <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              🎓 Tambah Kampus Baru
            </h3>
            <form onSubmit={handleSaveSchool} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Wilayah Tugas</label>
                <select
                  required
                  value={selectedRegionId}
                  onChange={(e) => setSelectedRegionId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-bold text-slate-700"
                >
                  <option value="">Pilih Wilayah</option>
                  {regions.map((reg) => (
                    <option key={reg.id} value={reg.id}>{reg.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Nama Kampus</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Universitas Indonesia"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-bold text-slate-700"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowaddCampusModal(false)
                    setSchoolName('')
                    setSelectedRegionId('')
                  }}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs hover:bg-slate-50 active:scale-95 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-500/10"
                >
                  Simpan Kampus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal Edit Kampus */}
      {editingSchoolId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in-50 duration-200">
          <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              ✏️ Edit Data Kampus
            </h3>
            <form onSubmit={handleSaveEditSchool} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Wilayah Tugas</label>
                <select
                  required
                  value={selectedRegionId}
                  onChange={(e) => setSelectedRegionId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-bold text-slate-700"
                >
                  <option value="">Pilih Wilayah</option>
                  {regions.map((reg) => (
                    <option key={reg.id} value={reg.id}>{reg.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Nama Kampus</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Universitas Indonesia"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-slate-50 font-bold text-slate-700"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSchoolId(null)
                    setSchoolName('')
                    setSelectedRegionId('')
                  }}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs hover:bg-slate-50 active:scale-95 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 active:scale-95 transition-all shadow-md shadow-emerald-500/10"
                >
                  Perbarui
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmLabel={confirmModal.confirmLabel}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({...prev, isOpen: false}))}
      />
    </div>
  )
}
