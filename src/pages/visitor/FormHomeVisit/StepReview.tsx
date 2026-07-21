import React from 'react'
import { emoticons } from './StepKuesioner'

interface StepReviewProps {
  instruments: any[]
  answers: Record<string, { rating: number; note: string }>
  manualVisitorName: string
  photosFormHomeVisit: string[]
  photoTampakDepan: string
  photoTampakDapur: string
  photoRuangTengah: string
  photoKamarMandi: string
  photoBersamaKeluarga: string
  photoBeritaAcara: string
}

export default function StepReview({
  instruments,
  answers,
  manualVisitorName,
  photosFormHomeVisit,
  photoTampakDepan,
  photoTampakDapur,
  photoRuangTengah,
  photoKamarMandi,
  photoBersamaKeluarga,
  photoBeritaAcara,
}: StepReviewProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
        👁️ Review Data Observasi
      </h3>

      {/* Info Visitor */}
      <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100 mb-4">
        <p className="text-xs text-emerald-800 font-medium">Nama Visitor (Anda): <span className="font-bold">{manualVisitorName || '-'}</span></p>
      </div>

      {/* Rekap Jawaban */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-800">Rekap Kuesioner:</h4>
        <div className="space-y-3">
          {instruments.map((inst, index) => {
            const ans = answers[inst.id]
            return (
              <div key={inst.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <p className="font-bold text-slate-800">
                  {index + 1}. {inst.pertanyaan || ''}
                </p>
                {inst.type !== 'essay' && (
                  <div className="mt-2 flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-slate-150">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {emoticons.find(e => e.val === ans?.rating)?.label || '❓'}
                      </span>
                      <span className="font-semibold text-slate-700 text-[10px] uppercase">
                        Skala: {ans?.rating} ({emoticons.find(e => e.val === ans?.rating)?.text})
                      </span>
                    </div>
                  </div>
                )}
                {ans?.note && (
                  <div className="mt-2 text-slate-500 bg-amber-50/50 p-2 rounded border border-amber-100/50">
                    <span className="font-semibold text-amber-800 block text-[10px]">{inst.type === 'essay' ? 'Jawaban:' : 'Catatan:'}</span>
                    {ans.note}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Rekap Dokumentasi */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h4 className="text-sm font-bold text-slate-800">Rekap Dokumentasi Foto:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Foto Depan */}
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col items-center">
            {photoTampakDepan ? (
              <img src={photoTampakDepan} className="w-full h-24 object-cover rounded-lg" alt="Depan Rumah" />
            ) : (
              <div className="w-full h-24 bg-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-400">Belum ada foto</div>
            )}
            <span className="text-[9px] font-bold text-slate-500 mt-2">Depan Rumah</span>
          </div>
          {/* Foto Dapur */}
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col items-center">
            {photoTampakDapur ? (
              <img src={photoTampakDapur} className="w-full h-24 object-cover rounded-lg" alt="Tampak Dapur" />
            ) : (
              <div className="w-full h-24 bg-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-400">Belum ada foto</div>
            )}
            <span className="text-[9px] font-bold text-slate-500 mt-2">Tampak Dapur</span>
          </div>
          {/* Foto Ruang Tengah */}
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col items-center">
            {photoRuangTengah ? (
              <img src={photoRuangTengah} className="w-full h-24 object-cover rounded-lg" alt="Ruang Tengah" />
            ) : (
              <div className="w-full h-24 bg-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-400">Belum ada foto</div>
            )}
            <span className="text-[9px] font-bold text-slate-500 mt-2">Ruang Tengah</span>
          </div>
          {/* Foto Kamar Mandi */}
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col items-center">
            {photoKamarMandi ? (
              <img src={photoKamarMandi} className="w-full h-24 object-cover rounded-lg" alt="Kamar Mandi" />
            ) : (
              <div className="w-full h-24 bg-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-400">Belum ada foto</div>
            )}
            <span className="text-[9px] font-bold text-slate-500 mt-2">Kamar Mandi</span>
          </div>
          {/* Foto Keluarga */}
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col items-center">
            {photoBersamaKeluarga ? (
              <img src={photoBersamaKeluarga} className="w-full h-24 object-cover rounded-lg" alt="Keluarga" />
            ) : (
              <div className="w-full h-24 bg-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-400">Belum ada foto</div>
            )}
            <span className="text-[9px] font-bold text-slate-500 mt-2">Keluarga</span>
          </div>
          {/* Foto Berita Acara */}
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col items-center">
            {photoBeritaAcara ? (
              <img src={photoBeritaAcara} className="w-full h-24 object-cover rounded-lg" alt="Berita Acara" />
            ) : (
              <div className="w-full h-24 bg-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-400">Belum ada foto</div>
            )}
            <span className="text-[9px] font-bold text-slate-500 mt-2">Berita Acara</span>
          </div>
          {/* Foto Home Visit (1st only in review, or count) */}
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col items-center">
            {photosFormHomeVisit.length > 0 ? (
              <div className="relative w-full h-24 rounded-lg overflow-hidden bg-white">
                <img src={photosFormHomeVisit[0]} className="w-full h-full object-cover" alt="Form Home Visit" />
                {photosFormHomeVisit.length > 1 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xs">
                    +{photosFormHomeVisit.length - 1} File
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-24 bg-slate-200 rounded-lg flex items-center justify-center text-[10px] text-slate-400">Belum ada foto</div>
            )}
            <span className="text-[9px] font-bold text-slate-500 mt-2">Form Fisik ({photosFormHomeVisit.length})</span>
          </div>
        </div>
      </div>
    </div>
  )
}
