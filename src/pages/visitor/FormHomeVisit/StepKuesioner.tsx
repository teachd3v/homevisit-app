import React from 'react'

export const emoticons = [
  { val: 1, label: '😢', text: 'Sangat Tidak Sesuai' },
  { val: 2, label: '🙁', text: 'Tidak Sesuai' },
  { val: 3, label: '😐', text: 'Cukup Sesuai' },
  { val: 4, label: '🙂', text: 'Sesuai' },
  { val: 5, label: '😄', text: 'Sangat Sesuai' }
]

interface StepKuesionerProps {
  instruments: any[]
  answers: Record<string, { rating: number; note: string }>
  handleRatingChange: (qId: string, rating: number) => void
  handleNoteChange: (qId: string, note: string) => void
  errors?: any
}

export default function StepKuesioner({
  instruments,
  answers,
  handleRatingChange,
  handleNoteChange,
  errors,
}: StepKuesionerProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
        📋 Form Kuesioner Observasi
      </h3>
      <div className="space-y-6">
        {instruments.map((inst, index) => {
          const currentAnswer = answers[inst.id] || { rating: 0, note: '' }
          const hasError = errors?.[inst.id]
          
          return (
            <div key={inst.id} className={`p-4 bg-slate-50 border rounded-2xl space-y-4 transition-colors ${hasError ? 'border-red-300 bg-red-50/30' : 'border-slate-100'}`}>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded bg-emerald-50 flex items-center justify-center text-[10px] font-bold text-emerald-700 shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-snug">
                    {inst.pertanyaan || ''}
                  </p>
                  {hasError && (
                    <p className="text-[10px] text-red-600 font-bold mt-1">*{hasError.rating?.message || hasError.note?.message || 'Wajib dijawab'}</p>
                  )}
                </div>
              </div>

              {/* Emoticon Likert 1-5 Row (Hidden if essay) */}
              {inst.type !== 'essay' && (
                <div className="grid grid-cols-5 gap-2 max-w-md mx-auto pt-2">
                  {emoticons.map((e) => {
                    const isSelected = currentAnswer.rating === e.val
                    return (
                      <button
                        key={e.val}
                        type="button"
                        onClick={() => handleRatingChange(inst.id, e.val)}
                        className={`flex flex-col items-center p-2 rounded-xl transition-all border text-center ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 shadow-sm ring-2 ring-emerald-100 scale-105'
                            : 'bg-white hover:bg-slate-50 active:scale-95 ' + (hasError?.rating ? 'border-red-200' : 'border-slate-200')
                        }`}
                      >
                        <span className="text-2xl">{e.label}</span>
                        <span className={`text-[8px] font-bold mt-1.5 leading-none ${
                          isSelected ? 'text-emerald-700' : 'text-slate-400'
                        }`}>
                          {e.text}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Notes / Essay Answer */}
              <div className="pt-2">
                <textarea
                  placeholder={inst.type === 'essay' ? "Tuliskan jawaban Anda secara rinci..." : "Tulis catatan (opsional)..."}
                  value={currentAnswer.note}
                  onChange={(e) => handleNoteChange(inst.id, e.target.value)}
                  rows={inst.type === 'essay' ? 4 : 2}
                  className={`w-full px-3 py-2 text-xs border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white resize-none ${hasError?.note ? 'border-red-300' : 'border-slate-200'}`}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
