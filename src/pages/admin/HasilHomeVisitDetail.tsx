import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useHomeVisitStore } from '../../store/homeVisitStore'
import { useCandidateStore } from '../../store/candidateStore'
import { useVisitorStore } from '../../store/visitorStore'

export default function HasilHomeVisitDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const results = useHomeVisitStore((state) => state.results)
  const candidates = useCandidateStore((state) => state.candidates)
  const visitors = useVisitorStore((state) => state.visitors)
  const loadResults = useHomeVisitStore((state) => state.loadFromAPI)

  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [edits, setEdits] = useState<Record<string, { rating: number, note: string }>>({})

  const updateResult = useHomeVisitStore((state) => state.updateResult)

  useEffect(() => {
    if (results.length === 0) {
      loadResults()
    }
    useCandidateStore.getState().loadFromAPI()
    useVisitorStore.getState().loadFromAPI()
  }, [])

  const result = results.find((r) => r.id === id)

  useEffect(() => {
    if (isEditing && result) {
      const initial: Record<string, { rating: number, note: string }> = {}
      ;(result.answers || []).forEach((p: any) => {
        initial[p.id] = { rating: p.score || 0, note: p.note || '' }
      })
      setEdits(initial)
    }
  }, [isEditing, result])

  const handleSaveEdits = async () => {
    if (!result) return

    const newAnswers = (result.answers || []).map((p: any) => {
      const edit = edits[p.id]
      const r = edit?.rating || p.score || 0
      return { ...p, score: r, note: edit?.note !== undefined ? edit.note : p.note || '' }
    })

    const totalScore = newAnswers.reduce((sum: number, item: any) => sum + (item.score || 0), 0)
    
    await updateResult(result.id, {
      answers: newAnswers,
      score: totalScore,
    })

    setIsEditing(false)
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl font-semibold text-gray-600 mb-4">Data detail tidak ditemukan</p>
          <button onClick={() => navigate(-1)} className="text-blue-600 font-bold hover:underline">Kembali</button>
        </div>
      </div>
    )
  }

  const candidate = candidates.find((c) => c.id === result.candidateId)
  const fasil = visitors.find((i) => i.id === result.fasilId)

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Detail Observasi Lapangan</h1>
              <p className="text-sm text-gray-600">ID: {result.id}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Profile Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Kandidat</h2>
            <p className="text-xl font-black text-gray-900">{candidate?.full_name || 'Memuat...'}</p>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600 flex items-center gap-2">🏫 Kampus: {candidate?.campus || '-'}</p>
              <p className="text-sm text-gray-600 flex items-center gap-2">🎓 Prodi: {candidate?.major || '-'}</p>
              <p className="text-sm text-gray-600 flex items-center gap-2">🚻 Jenis Kelamin: {candidate?.gender || '-'}</p>
              <p className="text-sm text-gray-600 flex items-center gap-2">📍 Wilayah: {candidate?.region || '-'}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Fasil Visitor</h2>
            <p className="text-xl font-black text-gray-900">{fasil?.name || fasil?.full_name || 'Memuat...'}</p>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600 flex items-center gap-2">📋 Role: {fasil?.role || '-'}</p>
              <p className="text-sm text-gray-600 flex items-center gap-2">🕒 Submit: {new Date(result.submittedAt).toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>

        {/* Skor Nilai Observasi Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="p-6 text-center bg-blue-50">
            <p className="text-sm font-bold text-gray-500 uppercase mb-1">Skor Nilai Observasi</p>
            <p className="text-4xl font-black text-blue-700">
              {result.score}
            </p>
          </div>
        </div>

        {/* Pertanyaan & Jawaban serta Catatan */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <span className="text-xl">📋</span> Data Observasi Lapangan
            </h2>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors" title="Edit Data">
                ✏️
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors">
                  Batal
                </button>
                <button onClick={handleSaveEdits} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors">
                  Simpan
                </button>
              </div>
            )}
          </div>
          <div className="space-y-8">
            {(result.answers || []).map((item: any) => (
              <div key={item.id} className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-700 leading-relaxed">{item.pertanyaan || item.label}</p>
                    
                    {(() => {
                      const emoticons = [
                        { val: 1, label: '😢', text: 'Sangat Tidak Sesuai' },
                        { val: 2, label: '🙁', text: 'Tidak Sesuai' },
                        { val: 3, label: '😐', text: 'Cukup Sesuai' },
                        { val: 4, label: '🙂', text: 'Sesuai' },
                        { val: 5, label: '😄', text: 'Sangat Sesuai' }
                      ]
                      
                      const ratingVal = isEditing ? (edits[item.id]?.rating || item.rating || item.score || 0) : (item.rating || item.score || 0)
                      const emo = emoticons.find(e => e.val === ratingVal)
                      
                      if (isEditing) {
                        return (
                          <div className="mt-3 flex gap-2 flex-wrap">
                            {emoticons.map(e => {
                              const isSelected = edits[item.id]?.rating === e.val
                              return (
                                <button
                                  key={e.val}
                                  onClick={() => setEdits(prev => ({...prev, [item.id]: { ...prev[item.id], rating: e.val }}))}
                                  className={`p-2 rounded-lg border flex flex-col items-center gap-1 min-w-[64px] transition-all ${
                                    isSelected ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'
                                  }`}
                                >
                                  <span className="text-xl">{e.label}</span>
                                  <span className={`text-[8px] font-bold uppercase ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`}>{e.val}</span>
                                </button>
                              )
                            })}
                          </div>
                        )
                      }

                      return (
                        <div className="mt-3 inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 w-auto">
                          <span className="text-xl">{emo?.label || '❓'}</span>
                          <span className="font-semibold text-slate-700 text-[10px] uppercase">
                            Skala: {ratingVal} ({emo?.text || 'Belum Dijawab'})
                          </span>
                        </div>
                      )
                    })()}
                  </div>
                </div>
                {isEditing ? (
                  <div className="mt-2">
                    <textarea 
                      value={edits[item.id]?.note !== undefined ? edits[item.id].note : (item.note || '')}
                      onChange={(e) => setEdits(prev => ({...prev, [item.id]: { ...prev[item.id], note: e.target.value }}))}
                      placeholder="Tambahkan catatan untuk poin ini..."
                      className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
                      rows={2}
                    />
                  </div>
                ) : (
                  item.note && (
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <p className="text-sm text-gray-700 italic font-medium leading-relaxed">" {item.note} "</p>
                    </div>
                  )
                )}
                {/* Fallback for legacy evidenceUrls if any */}
                {item.evidenceUrls && item.evidenceUrls.length > 0 && (
                  <div className="flex gap-2 pt-1">
                    {item.evidenceUrls.map((url: string, i: number) => (
                      <img 
                        key={i} 
                        src={url} 
                        className="w-24 h-24 object-cover rounded-lg border border-gray-100 cursor-zoom-in hover:opacity-80 transition-opacity" 
                        alt="bukti"
                        onClick={() => setSelectedImage(url)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dokumentasi Foto Tambahan */}
        {result.photos && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-wide border-b border-slate-100 pb-3">
              <span className="text-xl">📸</span> Dokumentasi Lapangan
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {(() => {
                const photos = []
                if (result.photos.tampakDepan) photos.push({ name: 'Tampak Depan', data: result.photos.tampakDepan })
                if (result.photos.tampakDapur) photos.push({ name: 'Tampak Dapur', data: result.photos.tampakDapur })
                if (result.photos.bersamaKeluarga) photos.push({ name: 'Bersama Keluarga', data: result.photos.bersamaKeluarga })
                if (result.photos.beritaAcara) photos.push({ name: 'Berita Acara', data: result.photos.beritaAcara })
                if (result.photos.formHomeVisit && result.photos.formHomeVisit.length > 0) {
                  result.photos.formHomeVisit.forEach((url: string, i: number) => {
                    photos.push({ name: `Form Home Visit ${i+1}`, data: url })
                  })
                }
                
                if (photos.length === 0) return <div className="col-span-full text-sm text-slate-500 py-4 italic">Tidak ada foto lapangan.</div>
                
                return photos.map((photo, i) => (
                  <div key={i} className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-zoom-in" onClick={() => setSelectedImage(photo.data)}>
                    <img src={photo.data} alt={photo.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                      <p className="text-white text-xs font-bold truncate">{photo.name}</p>
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal (Lightbox) */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <img 
            src={selectedImage} 
            className="max-w-full max-h-full rounded-lg shadow-2xl animate-in zoom-in duration-300" 
            alt="full size" 
          />
          <button 
            className="absolute top-6 right-6 text-white text-4xl font-bold"
            onClick={() => setSelectedImage(null)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
