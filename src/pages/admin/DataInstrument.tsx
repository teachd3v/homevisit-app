import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useInstruments, useAddInstrument, useUpdateInstrument, useDeleteInstrument } from '../../hooks/useInstruments'
import type { Instrument } from '../../types'
import ConfirmModal from '../../components/ConfirmModal'

export default function DataInstrument() {

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<string[]>([])
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void}>({isOpen: false, title: '', message: '', onConfirm: () => {}})

  const { data: instruments = [] } = useInstruments()
  const { mutateAsync: addInstrument } = useAddInstrument()
  const { mutateAsync: updateInstrument } = useUpdateInstrument()
  const { mutateAsync: deleteInstrument } = useDeleteInstrument()


  const toggleExpand = (id: string) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  useEffect(() => {
    
  }, [])

  const sortedInstruments = [...instruments].sort((a, b) => (a.urutan || 0) - (b.urutan || 0))



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
          <h1 className="text-2xl font-bold text-gray-900">Data Instrumen</h1>
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
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm font-medium text-gray-700">
            Total: {sortedInstruments.length} instrumen
          </p>
        </div>

        {/* Table & Cards */}
        {sortedInstruments.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">Belum ada data instrumen. Upload file Excel atau tambah manual.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg"
            >
              Tambah Instrumen Pertama
            </button>
          </div>
        ) : (
          <>
            {/* Desktop View Table */}
            <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 w-20">No</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Pertanyaan</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 w-32">Jenis</th>
                    
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 w-32">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedInstruments.map((instrument) => (
                    <tr key={instrument.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{instrument.urutan || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{instrument.pertanyaan || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${instrument.type === 'essay' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                          {instrument.type === 'essay' ? 'Esai' : 'Likert'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => setEditingId(instrument.id)}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: 'Hapus Instrumen',
                                message: 'Apakah Anda yakin ingin menghapus instrumen ini? Data akan dihapus secara permanen.',
                                onConfirm: async () => {
                                  await deleteInstrument(instrument.id)
                                  setConfirmModal(prev => ({...prev, isOpen: false}))
                                  setToast({ message: 'Instrumen berhasil dihapus', type: 'success' })
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View Cascading Cards */}
            <div className="block md:hidden space-y-4">
              {sortedInstruments.map((instrument) => {
                const isExpanded = expandedIds.includes(instrument.id)
                return (
                  <div key={instrument.id} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800 text-sm">
                            No. {instrument.urutan || '-'}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${instrument.type === 'essay' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                            {instrument.type === 'essay' ? 'Esai' : 'Likert'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 mt-1 font-medium">
                          {instrument.pertanyaan || '-'}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleExpand(instrument.id)}
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

                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            onClick={() => setEditingId(instrument.id)}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: 'Hapus Instrumen',
                                message: 'Apakah Anda yakin ingin menghapus instrumen ini? Data akan dihapus secara permanen.',
                                onConfirm: async () => {
                                  await deleteInstrument(instrument.id)
                                  setConfirmModal(prev => ({...prev, isOpen: false}))
                                  setToast({ message: 'Instrumen berhasil dihapus', type: 'success' })
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

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingId) && (
        <InstrumentFormModal
          instrument={editingId ? instruments.find((i) => i.id === editingId) : undefined}
          instruments={instruments}
          onClose={() => {
            setShowAddForm(false)
            setEditingId(null)
          }}
          onSave={async (instrument) => {
            if (editingId) {
              await updateInstrument({id: editingId, updates: instrument})
              setToast({ message: 'Instrumen berhasil diperbarui', type: 'success' })
              setEditingId(null)
              
            } else {
              await addInstrument(instrument)
              setToast({ message: 'Instrumen berhasil ditambahkan', type: 'success' })
              setShowAddForm(false)
              
            }
          }}
        />
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

interface InstrumentFormModalProps {
  instrument?: Instrument
  instruments: Instrument[]
  onClose: () => void
  onSave: (instrument: any) => void
}

function InstrumentFormModal({ instrument, instruments, onClose, onSave }: InstrumentFormModalProps) {
  const id = instrument?.id || `inst-${Date.now()}`
  
  const [urutan, setUrutan] = useState<number>(instrument?.urutan || instruments.length + 1)
  const [pertanyaan, setPertanyaan] = useState(instrument?.pertanyaan || '')
  const [type, setType] = useState<'likert' | 'essay'>(instrument?.type || 'likert')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    setError('')

    if (!urutan || !pertanyaan) {
      setError('Harap isi No dan Pertanyaan')
      return
    }

    onSave({
      id,
      pertanyaan,
      type,
      urutan: Number(urutan),
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {instrument ? 'Edit Instrumen' : 'Tambah Instrumen'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-bold text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No (Urutan)</label>
              <input
                type="number"
                value={urutan}
                onChange={(e) => setUrutan(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pertanyaan</label>
              <textarea
                value={pertanyaan}
                onChange={(e) => setPertanyaan(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
                placeholder="Ketik pertanyaan instrumen..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Soal</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'likert' | 'essay')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="likert">Skala Likert (Skor 1-4)</option>
                <option value="essay">Esai (Jawaban Teks)</option>
              </select>
            </div>

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

