export interface Candidate {
  id: string
  full_name: string
  campus: string
  region: string
  gender: string
  major: string
  ukt?: string
  home_visit_status?: 'pending' | 'lolos' | 'gagal'
  pantukhir_status?: 'lolos' | 'gagal' | null
  temuan_seleksi_berkas?: string | null
  temuan_seleksi_wawancara?: string | null
}

export interface Visitor {
  id: string
  regionId: string
  role: 'etoser' | 'mitra' | 'fasil'
  region?: Region
}

export interface Instrument {
  id: string
  pertanyaan: string
  type: 'likert' | 'essay'
  urutan: number
}

export interface Schedule {
  id: string
  candidateId: string
  visitorId: string
  schedule_date: string
  schedule_time?: string
  status: string
  notes?: string
}

export interface Region {
  id: string
  name: string
}

export interface Campus {
  id: string
  name: string
  regionId?: string
}

export interface HomeVisitResult {
  id: string
  candidateId: string
  fasilId: string
  visitorName?: string
  submittedAt: string
  answers: Array<{
    id: string
    pertanyaan: string
    score: number
    note?: string
  }>
  score: number
  status: string
  notes?: string
  photos?: any
}
