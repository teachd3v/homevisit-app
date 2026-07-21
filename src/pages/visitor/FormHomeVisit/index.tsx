import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useAuthStore } from '../../../store/authStore'
import { useCandidates } from '../../../hooks/useCandidates'
import { useAddHomeVisitResult } from '../../../hooks/useHomeVisitResults'
import { useInstruments } from '../../../hooks/useInstruments'
import type { HomeVisitResult } from '../../../types'

import StepKuesioner from './StepKuesioner'
import StepDokumentasi from './StepDokumentasi'
import StepReview from './StepReview'

export default function FormHomeVisit() {
  const { candidateId } = useParams()
  const navigate = useNavigate()
  const { visitorId, visitorName, role } = useAuthStore((state) => ({ 
    visitorId: state.visitorId,
    visitorName: state.visitorName,
    role: state.role
  }))

  const [currentStep, setCurrentStep] = useState<number>(1)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [submittedResult, setSubmittedResult] = useState<HomeVisitResult | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'warning' | 'error' } | null>(null)

  const { data: candidates = [] } = useCandidates()
  const { mutateAsync: addResult } = useAddHomeVisitResult()
  const { data: instruments = [] } = useInstruments()

  const candidate = candidates.find((c) => c.id === candidateId)

  // Dynamic Zod Schema based on fetched instruments
  const formSchema = useMemo(() => {
    const answerShape: Record<string, any> = {}
    instruments.forEach(inst => {
      if (inst.type === 'essay') {
        answerShape[inst.id] = z.object({
          rating: z.number().optional().default(0),
          note: z.string().min(1, 'Jawaban esai wajib diisi')
        })
      } else {
        answerShape[inst.id] = z.object({
          rating: z.number().min(1, 'Rating wajib dipilih'),
          note: z.string().optional()
        })
      }
    })

    return z.object({
      visitorName: z.string().min(1, 'Nama Visitor (Anda) wajib diisi'),
      answers: z.object(answerShape),
      photos: z.object({
        formHomeVisit: z.array(z.string()).min(1, 'Wajib upload minimal 1 foto dokumen fisik'),
        tampakDepan: z.string().min(1, 'Wajib upload foto tampak depan'),
        tampakDapur: z.string().min(1, 'Wajib upload foto dapur'),
        ruangTengah: z.string().min(1, 'Wajib upload foto ruang tengah'),
        kamarMandi: z.string().min(1, 'Wajib upload foto kamar mandi'),
        bersamaKeluarga: z.string().min(1, 'Wajib upload foto keluarga'),
        beritaAcara: z.string().min(1, 'Wajib upload foto berita acara')
      })
    })
  }, [instruments])

  type FormValues = z.infer<typeof formSchema>

  const {
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visitorName: '',
      answers: {},
      photos: {
        formHomeVisit: [],
        tampakDepan: '',
        tampakDapur: '',
        ruangTengah: '',
        kamarMandi: '',
        bersamaKeluarga: '',
        beritaAcara: ''
      }
    },
    mode: 'onChange'
  })

  const formAnswers = watch('answers') || {}
  const formPhotos = watch('photos')
  const manualVisitorName = watch('visitorName')

  useEffect(() => {
    if (!candidate) navigate('/visitor')
  }, [candidate, navigate])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  if (!candidate) return null

  const steps = [
    { num: 1, title: 'Form Observasi', icon: '📝' },
    { num: 2, title: 'Dokumentasi Observasi', icon: '📸' },
    { num: 3, title: 'Review Observasi', icon: '👁️' }
  ]

  const handleRatingChange = (qId: string, rating: number) => {
    setValue(`answers.${qId}.rating` as any, rating, { shouldValidate: true })
  }

  const handleNoteChange = (qId: string, note: string) => {
    setValue(`answers.${qId}.note` as any, note)
  }

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'homevisit' | 'depan' | 'dapur' | 'tengah' | 'mandi' | 'keluarga' | 'berita'
  ) => {
    const files = e.target.files
    if (!files) return

    const maxSize = 10 * 1024 * 1024 // 10MB
    const label = '10MB'

    const readAndStore = (file: File) => {
      if (file.size > maxSize) {
        alert(`Batas maksimal ukuran file ${type} adalah ${label}. File "${file.name}" terlalu besar.`)
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 800
          const MAX_HEIGHT = 800
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT }
          }
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          
          const base64 = canvas.toDataURL('image/jpeg', 0.5)
          const currentPhotos = getValues('photos')

          if (type === 'homevisit') {
            if (currentPhotos.formHomeVisit.length >= 10) {
              alert('Maksimal 10 file untuk Foto Dokumen Fisik!')
              return
            }
            setValue('photos.formHomeVisit', [...currentPhotos.formHomeVisit, base64], { shouldValidate: true })
          } else if (type === 'depan') {
            setValue('photos.tampakDepan', base64, { shouldValidate: true })
          } else if (type === 'dapur') {
            setValue('photos.tampakDapur', base64, { shouldValidate: true })
          } else if (type === 'tengah') {
            setValue('photos.ruangTengah', base64, { shouldValidate: true })
          } else if (type === 'mandi') {
            setValue('photos.kamarMandi', base64, { shouldValidate: true })
          } else if (type === 'keluarga') {
            setValue('photos.bersamaKeluarga', base64, { shouldValidate: true })
          } else if (type === 'berita') {
            setValue('photos.beritaAcara', base64, { shouldValidate: true })
          }
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    }

    Array.from(files).forEach(readAndStore)
  }

  const removeHomeVisitPhoto = (index: number) => {
    const currentList = getValues('photos.formHomeVisit')
    setValue('photos.formHomeVisit', currentList.filter((_, idx) => idx !== index), { shouldValidate: true })
  }

  const handleNext = async () => {
    let isValid = false
    if (currentStep === 1) {
      const isNameValid = await trigger('visitorName')
      const isAnswersValid = await trigger('answers')
      isValid = isNameValid && isAnswersValid
    } else if (currentStep === 2) {
      isValid = await trigger('photos')
    }

    if (isValid) {
      setCurrentStep(prev => prev + 1)
    } else {
      setToast({ message: "Silakan periksa kembali isian yang berwarna merah.", type: "warning" })
      setTimeout(() => setToast(null), 3000)
    }
  }

  const handlePrev = () => setCurrentStep(prev => prev - 1)

  const onSubmitClick = async () => {
    const isValid = await trigger()
    if (!isValid) {
      setToast({ message: "Ada data yang belum lengkap, mohon periksa kembali.", type: "error" })
      setTimeout(() => setToast(null), 3000)
      return
    }

    const { visitorName: manualName, answers, photos } = getValues()

    const answersList = instruments.map((inst) => {
      const ans = (answers as any)[inst.id]
      return {
        id: inst.id,
        pertanyaan: inst.pertanyaan || '',
        score: ans?.rating || 0,
        note: ans?.note || ''
      }
    })

    const totalScore = answersList.reduce((sum, item) => sum + item.score, 0)
    const likertInstruments = instruments.filter(inst => inst.type !== 'essay')
    const maxScore = likertInstruments.length * 5
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0
    const status = percentage >= 60 ? 'Lolos' : 'Tidak Lolos' 

    const compiledNotes = answersList
      .filter(data => data.note.trim() !== '')
      .map(data => `[Tanya: ${data.pertanyaan}] Catatan: ${data.note}`)
      .join('\n')

    const resultPayload: Omit<HomeVisitResult, 'id'> = {
      candidateId: candidateId || '',
      fasilId: visitorId || '',
      visitorName: manualName || '',
      submittedAt: new Date().toISOString(),
      answers: answersList,
      score: Math.round(percentage),
      status: status,
      notes: compiledNotes,
      photos: {
        formHomeVisit: photos.formHomeVisit,
        tampakDepan: photos.tampakDepan,
        tampakDapur: photos.tampakDapur,
        ruangTengah: photos.ruangTengah,
        kamarMandi: photos.kamarMandi,
        bersamaKeluarga: photos.bersamaKeluarga,
        beritaAcara: photos.beritaAcara
      }
    }

    try { 
      await addResult(resultPayload)
      setSubmittedResult({ id: `result-${Date.now()}`, ...resultPayload })
      setShowSuccessModal(true)
    } catch (err) { 
      setToast({ message: "Gagal menyimpan hasil: " + (err as Error).message, type: "error" })
    } 
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between pb-12">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${toast.type === 'error' ? 'bg-red-600' : 'bg-amber-500'} text-white font-bold py-2.5 px-6 rounded-full shadow-lg text-sm transition-all animate-bounce`}>
          {toast.message}
        </div>
      )}

      {/* Topbar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Form Observasi</h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              oleh: <span className="font-semibold text-slate-700">{visitorName}</span> ({(role || "").toUpperCase()})
            </p>
          </div>
          <button
            onClick={() => navigate('/visitor')}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-600 active:scale-95 transition-all"
            title="Tutup Form"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Candidate Profile Card */}
      <div className="max-w-4xl mx-auto w-full px-4 mt-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1">
            <h2 className="text-base font-extrabold text-slate-800 leading-tight">
              {candidate.full_name}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ID: {candidate.id} • {candidate.campus} ({candidate.major})
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-block bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded">
                📍 {candidate.region}
              </span>
              <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                {candidate.gender}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Header */}
      <div className="max-w-4xl mx-auto w-full px-4 mt-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-3 shadow-sm flex justify-between items-center gap-1">
          {steps.map((step, idx) => (
            <div key={step.num} className="flex items-center flex-1 justify-center">
              <button
                type="button"
                onClick={() => {
                   // Optional: allow jumping back, but prevent jumping forward without validation
                   if (step.num < currentStep) setCurrentStep(step.num)
                }}
                className={`flex flex-col items-center focus:outline-none group transition-all ${step.num <= currentStep ? 'cursor-pointer active:scale-95' : 'cursor-not-allowed opacity-60'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    currentStep === step.num
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md'
                      : currentStep > step.num
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {currentStep > step.num ? '✓' : step.icon}
                </div>
                <span
                  className={`text-[9px] font-bold mt-1.5 whitespace-nowrap transition-colors ${
                    currentStep === step.num ? 'text-emerald-700' : 'text-slate-400'
                  }`}
                >
                  {step.title}
                </span>
              </button>
              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    currentStep > step.num ? 'bg-emerald-600' : 'bg-slate-100'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Content */}
      <div className="max-w-4xl mx-auto w-full px-4 mt-6 flex-1">
        <div className="bg-white rounded-3xl border border-slate-100 p-5 md:p-6 shadow-sm">
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Input Nama Visitor */}
              <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
                <label className="block text-sm font-black text-slate-800">
                  Siapa Nama Anda? <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  value={manualVisitorName}
                  onChange={(e) => setValue('visitorName', e.target.value, { shouldValidate: true })}
                  placeholder="Masukkan nama lengkap Anda..."
                  className={`w-full text-sm p-4 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-inner ${
                    errors.visitorName ? 'border-red-400 focus:ring-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.visitorName && (
                  <p className="text-xs text-red-500 font-bold ml-1">{errors.visitorName.message}</p>
                )}
              </div>

              <StepKuesioner 
                instruments={instruments} 
                answers={formAnswers as any} 
                handleRatingChange={handleRatingChange} 
                handleNoteChange={handleNoteChange} 
                errors={errors.answers}
              />
            </div>
          )}
          {currentStep === 2 && (
            <StepDokumentasi 
              photosFormHomeVisit={formPhotos?.formHomeVisit || []}
              photoTampakDepan={formPhotos?.tampakDepan || ''}
              photoTampakDapur={formPhotos?.tampakDapur || ''}
              photoRuangTengah={formPhotos?.ruangTengah || ''}
              photoKamarMandi={formPhotos?.kamarMandi || ''}
              photoBersamaKeluarga={formPhotos?.bersamaKeluarga || ''}
              photoBeritaAcara={formPhotos?.beritaAcara || ''}
              handleFileUpload={handleFileUpload}
              removeHomeVisitPhoto={removeHomeVisitPhoto}
              errors={errors.photos}
            />
          )}
          {currentStep === 3 && (
            <StepReview
              instruments={instruments}
              answers={formAnswers as any}
              manualVisitorName={manualVisitorName}
              photosFormHomeVisit={formPhotos?.formHomeVisit || []}
              photoTampakDepan={formPhotos?.tampakDepan || ''}
              photoTampakDapur={formPhotos?.tampakDapur || ''}
              photoRuangTengah={formPhotos?.ruangTengah || ''}
              photoKamarMandi={formPhotos?.kamarMandi || ''}
              photoBersamaKeluarga={formPhotos?.bersamaKeluarga || ''}
              photoBeritaAcara={formPhotos?.beritaAcara || ''}
            />
          )}
        </div>

        {/* Action Bottom Buttons */}
        <div className="mt-6 flex justify-between items-center gap-3">
          {currentStep > 1 ? (
            <button
              onClick={handlePrev}
              type="button"
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 active:scale-95 transition-all text-xs font-bold"
            >
              Kembali
            </button>
          ) : (
            <button
              onClick={() => navigate('/visitor')}
              type="button"
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-red-600 bg-white hover:bg-red-50 active:scale-95 transition-all text-xs font-bold"
            >
              Batal
            </button>
          )}

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              type="button"
              className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 active:scale-95 transition-all text-xs font-bold shadow-md shadow-emerald-500/10"
            >
              Lanjut
            </button>
          ) : (
            <button
              onClick={onSubmitClick}
              type="button"
              className="px-8 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 active:scale-95 transition-all text-xs font-bold shadow-md shadow-green-500/10"
            >
              Kirim Hasil Observasi
            </button>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && submittedResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in-50 duration-200">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <h2 className="text-xl font-bold text-slate-800">Observasi Selesai!</h2>
            <p className="text-xs text-slate-500">Data hasil observasi telah berhasil disimpan secara aman di system browser database.</p>

            <div className="bg-slate-50 rounded-2xl p-4 text-left text-xs space-y-3.5 border border-slate-100">
              <div className="border-b border-slate-200/60 pb-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nama Lengkap</p>
                <p className="font-extrabold text-slate-800 text-sm">{candidate?.full_name}</p>
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ID Kandidat</p>
                  <p className="font-bold text-slate-700">{candidate.id}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Jenis Kelamin</p>
                  <p className="font-bold text-slate-700">{candidate.gender || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kampus</p>
                  <p className="font-bold text-slate-700">{candidate.campus || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Program Studi</p>
                  <p className="font-bold text-slate-700">{candidate.major || '—'}</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setShowSuccessModal(false)
                  navigate('/visitor')
                }}
                className="w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/10"
              >
                Ke Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
