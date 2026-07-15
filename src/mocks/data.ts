export interface Candidate {
  id: string
  fullName: string
  gender: string
  region: string
  campus: string
  major: string
}

export interface Visitor {
  id: string
  fullName: string
  role: 'etoser' | 'mitra' | 'fasil'
  region: string
}

export interface InterviewSchedule {
  id: string
  candidateId: string
  date: string
  etoser: Visitor | null
  mitra: Visitor | null
  fasil: Visitor | null
  status: 'belum' | 'berjalan' | 'selesai'
}

export const mockCandidates: Candidate[] = [
  {
    id: '001',
    fullName: 'Ahmad Rizki Pratama',
    gender: 'Laki-laki',
    region: 'DKI Jakarta',
    campus: 'Universitas Indonesia',
    major: 'Teknik Informatika',
  },
  {
    id: '002',
    fullName: 'Siti Nurhaliza Wijaya',
    gender: 'Perempuan',
    region: 'Jawa Barat',
    campus: 'Institut Teknologi Bandung',
    major: 'Sistem Informasi',
  },
  {
    id: '003',
    fullName: 'Budi Santoso',
    gender: 'Laki-laki',
    region: 'Jawa Timur',
    campus: 'Universitas Airlangga',
    major: 'Manajemen',
  },
  {
    id: '004',
    fullName: 'Dewi Kusuma Negara',
    gender: 'Perempuan',
    region: 'Sumatera Utara',
    campus: 'Universitas Sumatera Utara',
    major: 'Akuntansi',
  },
  {
    id: '005',
    fullName: 'Muhammad Fajar Hadyan',
    gender: 'Laki-laki',
    region: 'DI Yogyakarta',
    campus: 'Universitas Gadjah Mada',
    major: 'Psikologi',
  },
]

export const mockVisitors: Visitor[] = [
  {
    id: 'vis-001',
    fullName: 'Dr. Bambang Sutrisno',
    role: 'etoser',
    region: 'DKI Jakarta',
  },
  {
    id: 'vis-002',
    fullName: 'Ibu Sinta Wijaya',
    role: 'etoser',
    region: 'DKI Jakarta',
  },
  {
    id: 'vis-003',
    fullName: 'Pak Hendra Gunawan',
    role: 'mitra',
    region: 'Jawa Barat',
  },
  {
    id: 'vis-004',
    fullName: 'Dr. Eka Putri',
    role: 'mitra',
    region: 'Jawa Timur',
  },
  {
    id: 'vis-005',
    fullName: 'Fasil Ahmad Syaiful',
    role: 'fasil',
    region: 'DKI Jakarta',
  },
  {
    id: 'vis-006',
    fullName: 'Fasil Sri Rahayu',
    role: 'fasil',
    region: 'Jawa Barat',
  },
]

export const mockSchedules: InterviewSchedule[] = [
  {
    id: 'sch-001',
    candidateId: '001',
    date: '2025-06-01',
    etoser: mockVisitors[0],
    mitra: null,
    fasil: null,
    status: 'belum',
  },
  {
    id: 'sch-002',
    candidateId: '002',
    date: '2025-06-01',
    etoser: mockVisitors[1],
    mitra: mockVisitors[2],
    fasil: mockVisitors[4],
    status: 'berjalan',
  },
  {
    id: 'sch-003',
    candidateId: '003',
    date: '2025-06-02',
    etoser: mockVisitors[0],
    mitra: mockVisitors[3],
    fasil: mockVisitors[5],
    status: 'selesai',
  },
]

