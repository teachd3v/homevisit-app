import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useVisitors, useAddVisitor, useUpdateVisitor, useDeleteVisitor } from '../../hooks/useVisitors'
import { useRegions } from '../../hooks/useRegions'
import type { Visitor } from '../../types'
import ConfirmModal from '../../components/ConfirmModal'

export default function DataVisitor() {

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<string[]>([])
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void}>({isOpen: false, title: '', message: '', onConfirm: () => {}})

  const { data: visitors = [] } = useVisitors()
  const { mutateAsync: addVisitor } = useAddVisitor()
  const { mutateAsync: updateVisitor } = useUpdateVisitor()
  const { mutateAsync: deleteVisitor } = useDeleteVisitor()


  const toggleExpand = (id: string) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  useEffect(() => {
    
  }, [])

  const filteredVisitors = [...visitors].sort((a, b) => String(a.id).localeCompare(String(b.id)))

  // Group visitors by role for mobile view
  const visitorsByRole = filteredVisitors.reduce((acc, visitor) => {
    const role = visitor.role || 'etoser'
    if (!acc[role]) acc[role] = []
    acc[role].push(visitor)
    return acc
  }, {} as Record<string, typeof filteredVisitors>)



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/admin" className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Data Visitor</h1>
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
        {/* Summary */}
        <div className="flex justify-end mb-6">
          <p className="text-sm font-medium text-gray-700">
            Showing {filteredVisitors.length} / {visitors.length} visitor
          </p>
        </div>

        {/* Table */}
        {visitors.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">Belum ada data visitor. Upload file Excel atau tambah manual.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg"
            >
              Tambah Visitor Pertama
            </button>
          </div>
        ) : (
          <>
            {/* Desktop View Table */}
            <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Wilayah</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVisitors.map((visitor) => (
                    <tr key={visitor.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{visitor.id}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {visitor.region?.name || 'Tidak ada wilayah'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            visitor.role === 'etoser'
                              ? 'bg-blue-100 text-blue-800'
                              : visitor.role === 'mitra'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {visitor.role.charAt(0).toUpperCase() + visitor.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => setEditingId(visitor.id)}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: 'Hapus Visitor',
                                message: `Apakah Anda yakin ingin menghapus visitor wilayah ${visitor.regionId}? Data akan dihapus secara permanen.`,
                                onConfirm: async () => {
                                  await deleteVisitor(visitor.id)
                                  setConfirmModal(prev => ({...prev, isOpen: false}))
                                  setToast({ message: 'Visitor berhasil dihapus', type: 'success' })
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
              {Object.entries(visitorsByRole).map(([roleKey, roleVisitors]) => (
                <div key={roleKey} className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 inline-block uppercase tracking-wider">
                    🧑‍💼 Peran: {roleKey} ({roleVisitors.length})
                  </h3>
                  <div className="space-y-3">
                    {roleVisitors.map((visitor) => {
                      const isExpanded = expandedIds.includes(visitor.id)
                      return (
                        <div key={visitor.id} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 pr-2">
                              <p className="font-bold text-slate-800 text-base">{visitor.region?.name || 'Tidak ada wilayah'}</p>
                              <p className="text-xs text-slate-500 mt-0.5">ID: {visitor.id}</p>
                            </div>
                            <button
                              onClick={() => toggleExpand(visitor.id)}
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
                            <div className="pt-3 border-t border-slate-100 flex gap-2 justify-end animate-in fade-in-50 duration-200">
                              <button
                                onClick={() => setEditingId(visitor.id)}
                                className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => {
                                  setConfirmModal({
                                    isOpen: true,
                                    title: 'Hapus Visitor',
                                    message: `Apakah Anda yakin ingin menghapus visitor wilayah ${visitor.region?.name}? Data akan dihapus secara permanen.`,
                                    onConfirm: async () => {
                                      await deleteVisitor(visitor.id)
                                      setConfirmModal(prev => ({...prev, isOpen: false}))
                                      setToast({ message: 'Visitor berhasil dihapus', type: 'success' })
                                      setTimeout(() => setToast(null), 3000)
                                    }
                                  })
                                }}
                                className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                              >
                                🗑️ Hapus
                              </button>
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

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingId) && (() => {
        const suggestedId = (() => {
          const numericIds = visitors
            .map((i) => {
              const match = i.id.match(/^vis-(\d+)$/)
              return match ? parseInt(match[1], 10) : null
            })
            .filter((num): num is number => num !== null)
          const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0
          return `vis-${String(maxId + 1).padStart(3, '0')}`
        })()

        return (
          <VisitorFormModal
            visitor={editingId ? visitors.find((i) => i.id === editingId) : undefined}
            suggestedId={suggestedId}
            onClose={() => {
              setShowAddForm(false)
              setEditingId(null)
            }}
            onSave={async (visitor) => {
              if (editingId) {
                await updateVisitor({id: editingId, updates: { ...visitor }})
                setToast({ message: 'Visitor updated successfully', type: 'success' })
                setEditingId(null)
                
              } else {
                await addVisitor({ ...visitor })
                setToast({ message: 'Visitor added successfully', type: 'success' })
                setShowAddForm(false)
                
              }
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

interface VisitorFormModalProps {
  visitor?: Visitor
  suggestedId: string
  onClose: () => void
  onSave: (visitor: Visitor) => void
}

function VisitorFormModal({ visitor, suggestedId, onClose, onSave }: VisitorFormModalProps) {
  const [id, setId] = useState(visitor?.id || suggestedId)
  const [regionId, setRegionId] = useState(visitor?.regionId || '')
  const [role, setRole] = useState<'etoser' | 'mitra' | 'fasil'>(visitor?.role || 'etoser')
  const [error, setError] = useState('')

  const { data: regions = [] } = useRegions()

  const handleSubmit = () => {
    setError('')

    if (!id || !regionId || !role) {
      setError('Harap lengkapi semua field')
      return
    }

    onSave({
      id,
      regionId,
      role,
    } as Visitor)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {visitor ? 'Edit Visitor' : 'Tambah Visitor'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-bold text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              disabled={!!visitor}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="vis-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wilayah</label>
            <select
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="" disabled>Pilih wilayah...</option>
              {regions.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'etoser' | 'mitra' | 'fasil')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="etoser">Etoser</option>
              <option value="mitra">Mitra</option>
              <option value="fasil">Fasil</option>
            </select>
          </div>


        </div>

        <div className="border-t border-gray-200 p-6 flex gap-3 justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 font-medium rounded-lg"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  )
}





