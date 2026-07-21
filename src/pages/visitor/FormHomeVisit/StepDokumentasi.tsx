import React from 'react'

interface StepDokumentasiProps {
  photosFormHomeVisit: string[]
  photoTampakDepan: string
  photoTampakDapur: string
  photoRuangTengah: string
  photoKamarMandi: string
  photoBersamaKeluarga: string
  photoBeritaAcara: string
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'homevisit' | 'depan' | 'dapur' | 'tengah' | 'mandi' | 'keluarga' | 'berita') => void
  removeHomeVisitPhoto: (index: number) => void
  errors?: any
}

export default function StepDokumentasi({
  photosFormHomeVisit,
  photoTampakDepan,
  photoTampakDapur,
  photoRuangTengah,
  photoKamarMandi,
  photoBersamaKeluarga,
  photoBeritaAcara,
  handleFileUpload,
  removeHomeVisitPhoto,
  errors,
}: StepDokumentasiProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
        📸 Dokumentasi & Foto Lapangan
      </h3>
      <p className="text-xs text-slate-500 leading-relaxed bg-amber-50 text-amber-800 border border-amber-100 rounded-xl p-3">
        ⚠️ **PENTING**: Semua foto dokumentasi di bawah ini wajib diunggah secara lengkap sebelum lanjut ke tahap review hasil observasi.
      </p>

      <div className="space-y-5">
        {/* 1. Foto Dokumen Fisik Form Home Visit */}
        <div className={`p-4 bg-slate-50 border rounded-2xl space-y-3 ${errors?.formHomeVisit ? 'border-red-300' : 'border-slate-100'}`}>
          <div>
            <label className="text-sm font-bold text-slate-800 block">
              1. Foto Dokumen Fisik Form Home Visit <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Bisa unggah beberapa file (Maksimal 10 file, @max 10MB)
            </span>
            {errors?.formHomeVisit && <p className="text-[10px] text-red-600 font-bold mt-1">*{errors.formHomeVisit.message}</p>}
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileUpload(e, 'homevisit')}
            className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
          />
          {photosFormHomeVisit.length > 0 && (
            <div className="grid grid-cols-5 gap-2 pt-2">
              {photosFormHomeVisit.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-lg border border-slate-200 overflow-hidden bg-white group">
                  <img src={photo} className="w-full h-full object-cover" alt="Home Visit" />
                  <button
                    type="button"
                    onClick={() => removeHomeVisitPhoto(index)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center hover:bg-red-700 active:scale-90 shadow-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Foto Tampak Depan Rumah */}
        <div className={`p-4 bg-slate-50 border rounded-2xl space-y-3 ${errors?.tampakDepan ? 'border-red-300' : 'border-slate-100'}`}>
          <div>
            <label className="text-sm font-bold text-slate-800 block">
              2. Foto Tampak Depan Rumah <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Wajib 1 foto saja (Maksimal ukuran 10MB)
            </span>
            {errors?.tampakDepan && <p className="text-[10px] text-red-600 font-bold mt-1">*{errors.tampakDepan.message}</p>}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'depan')}
            className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
          />
          {photoTampakDepan && (
            <div className="relative w-28 h-28 rounded-lg border border-slate-200 overflow-hidden bg-white">
              <img src={photoTampakDepan} className="w-full h-full object-cover" alt="Tampak Depan" />
            </div>
          )}
        </div>

        {/* 3. Foto Tampak Dapur */}
        <div className={`p-4 bg-slate-50 border rounded-2xl space-y-3 ${errors?.tampakDapur ? 'border-red-300' : 'border-slate-100'}`}>
          <div>
            <label className="text-sm font-bold text-slate-800 block">
              3. Foto Tampak Dapur <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Wajib 1 foto saja (Maksimal ukuran 10MB)
            </span>
            {errors?.tampakDapur && <p className="text-[10px] text-red-600 font-bold mt-1">*{errors.tampakDapur.message}</p>}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'dapur')}
            className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
          />
          {photoTampakDapur && (
            <div className="relative w-28 h-28 rounded-lg border border-slate-200 overflow-hidden bg-white">
              <img src={photoTampakDapur} className="w-full h-full object-cover" alt="Tampak Dapur" />
            </div>
          )}
        </div>

        {/* 4. Foto Ruang Tengah */}
        <div className={`p-4 bg-slate-50 border rounded-2xl space-y-3 ${errors?.ruangTengah ? 'border-red-300' : 'border-slate-100'}`}>
          <div>
            <label className="text-sm font-bold text-slate-800 block">
              4. Foto Ruang Tengah <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Wajib 1 foto saja (Maksimal ukuran 10MB)
            </span>
            {errors?.ruangTengah && <p className="text-[10px] text-red-600 font-bold mt-1">*{errors.ruangTengah.message}</p>}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'tengah')}
            className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
          />
          {photoRuangTengah && (
            <div className="relative w-28 h-28 rounded-lg border border-slate-200 overflow-hidden bg-white">
              <img src={photoRuangTengah} className="w-full h-full object-cover" alt="Ruang Tengah" />
            </div>
          )}
        </div>

        {/* 5. Foto Kamar Mandi */}
        <div className={`p-4 bg-slate-50 border rounded-2xl space-y-3 ${errors?.kamarMandi ? 'border-red-300' : 'border-slate-100'}`}>
          <div>
            <label className="text-sm font-bold text-slate-800 block">
              5. Foto Kamar Mandi <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Wajib 1 foto saja (Maksimal ukuran 10MB)
            </span>
            {errors?.kamarMandi && <p className="text-[10px] text-red-600 font-bold mt-1">*{errors.kamarMandi.message}</p>}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'mandi')}
            className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
          />
          {photoKamarMandi && (
            <div className="relative w-28 h-28 rounded-lg border border-slate-200 overflow-hidden bg-white">
              <img src={photoKamarMandi} className="w-full h-full object-cover" alt="Kamar Mandi" />
            </div>
          )}
        </div>

        {/* 6. Foto Bersama Keluarga Pendaftar */}
        <div className={`p-4 bg-slate-50 border rounded-2xl space-y-3 ${errors?.bersamaKeluarga ? 'border-red-300' : 'border-slate-100'}`}>
          <div>
            <label className="text-sm font-bold text-slate-800 block">
              6. Foto Bersama Keluarga Pendaftar <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Wajib 1 foto saja (Maksimal ukuran 10MB)
            </span>
            {errors?.bersamaKeluarga && <p className="text-[10px] text-red-600 font-bold mt-1">*{errors.bersamaKeluarga.message}</p>}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'keluarga')}
            className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
          />
          {photoBersamaKeluarga && (
            <div className="relative w-28 h-28 rounded-lg border border-slate-200 overflow-hidden bg-white">
              <img src={photoBersamaKeluarga} className="w-full h-full object-cover" alt="Keluarga" />
            </div>
          )}
        </div>

        {/* 7. Foto Berita Acara */}
        <div className={`p-4 bg-slate-50 border rounded-2xl space-y-3 ${errors?.beritaAcara ? 'border-red-300' : 'border-slate-100'}`}>
          <div>
            <label className="text-sm font-bold text-slate-800 block">
              7. Foto Berita Acara <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Wajib 1 foto saja (Maksimal ukuran 10MB)
            </span>
            {errors?.beritaAcara && <p className="text-[10px] text-red-600 font-bold mt-1">*{errors.beritaAcara.message}</p>}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'berita')}
            className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
          />
          {photoBeritaAcara && (
            <div className="relative w-28 h-28 rounded-lg border border-slate-200 overflow-hidden bg-white">
              <img src={photoBeritaAcara} className="w-full h-full object-cover" alt="Berita Acara" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
