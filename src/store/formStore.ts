import { create } from 'zustand'
import { Instrument } from '../types'

export interface AnswerIndicator {
  id: string
  label: string
  pertanyaan?: string
  score: number | null
}

interface FormState {
  candidateId: string | null
  answers: AnswerIndicator[]
  notes: string
  setCandidate: (id: string) => void
  updateAnswer: (id: string, score: number) => void
  setNotes: (notes: string) => void
  reset: () => void
  isComplete: () => boolean
  initializeFromInstruments: (instruments: Instrument[]) => void
}

export const useFormStore = create<FormState>((set, get) => ({
  candidateId: null,
  answers: [],
  notes: '',

  setCandidate: (id) => set({ candidateId: id }),

  updateAnswer: (id, score) =>
    set((state) => ({
      answers: state.answers.map((item) => (item.id === id ? { ...item, score } : item)),
    })),

  setNotes: (notes) => set({ notes }),

  reset: () => set({ candidateId: null, notes: '', answers: get().answers.map(a => ({...a, score: null})) }),

  isComplete: () => {
    const { answers } = get()
    return answers.every((a) => a.score !== null)
  },

  initializeFromInstruments: (instruments) => {
    const answers = instruments.map(i => ({
      id: i.id,
      label: i.pertanyaan || '',
      pertanyaan: i.pertanyaan,
      score: null,
    })).sort((a, b) => {
      const idxA = instruments.find(i => i.id === a.id)?.urutan || 0
      const idxB = instruments.find(i => i.id === b.id)?.urutan || 0
      return idxA - idxB
    })
    set({ answers })
  }
}))

