import * as XLSX from 'xlsx'
import { api } from '../lib/api'
import { Candidate, Visitor, Instrument, Schedule } from '../types'

export interface ParsedCandidateData {
  candidates: Candidate[]
  errors: string[]
}

export interface ParsedVisitorData {
  visitors: Visitor[]
  errors: string[]
}

export interface ParsedScheduleData {
  schedules: Array<{
    regionId: string
    interview_date: string
    etoser_id?: string
    mitra_id?: string
    fasil_id?: string
    status: 'belum' | 'berjalan' | 'selesai'
    candidate_ids: string[]
  }>
  errors: string[]
}

export interface ParsedInstrumentData {
  instruments: Instrument[]
  errors: string[]
}

export const parseExcelFile = (file: File): Promise<ParsedCandidateData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]

        if (!worksheet) {
          reject(new Error('No worksheet found in Excel file'))
          return
        }

        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet)

        if (rows.length === 0) {
          reject(new Error('Excel file is empty'))
          return
        }

        const candidates: Candidate[] = []
        const errors: string[] = []

        rows.forEach((row, index) => {
          try {
            // Flexible column name matching (case-insensitive, trim spaces)
            const id = String(row['ID'] || row['id'] || row['Id'] || '').trim()
            const fullName = String(row['Nama'] || row['nama'] || row['Name'] || row['name'] || '').trim()
            const gender = String(row['JenisKelamin'] || row['jenisKelamin'] || row['Jenis Kelamin'] || row['gender'] || row['Gender'] || '').trim()
            const region = String(row['Wilayah'] || row['wilayah'] || row['Region'] || row['region'] || '').trim()
            const campus = String(row['Kampus'] || row['kampus'] || row['Campus'] || row['campus'] || row['Sekolah'] || row['sekolah'] || '').trim()
            const major = String(row['Prodi'] || row['prodi'] || row['Program Studi'] || row['Major'] || row['major'] || '').trim()
            const ukt = String(row['UKT'] || row['ukt'] || '').trim()

            // Validation
            if (!id) {
              errors.push(`Row ${index + 2}: ID is required`)
              return
            }
            if (!fullName) {
              errors.push(`Row ${index + 2}: Nama is required`)
              return
            }
            if (!gender) {
              errors.push(`Row ${index + 2}: JenisKelamin is required`)
              return
            }
            if (!region) {
              errors.push(`Row ${index + 2}: Wilayah is required`)
              return
            }
            if (!campus) {
              errors.push(`Row ${index + 2}: Kampus is required`)
              return
            }
            if (!major) {
              errors.push(`Row ${index + 2}: Prodi is required`)
              return
            }

            candidates.push({
              id,
              full_name: fullName,
              campus,
              region,
              gender,
              major,
              ukt,
            })
          } catch (error) {
            errors.push(`Row ${index + 2}: Failed to parse row`)
          }
        })

        resolve({
          candidates,
          errors,
        })
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${(error as Error).message}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsArrayBuffer(file)
  })
}

export const parseVisitorExcelFile = async (file: File): Promise<ParsedVisitorData> => {
  return new Promise(async (resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]

        if (!worksheet) {
          reject(new Error('No worksheet found in Excel file'))
          return
        }

        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet)

        if (rows.length === 0) {
          reject(new Error('Excel file is empty'))
          return
        }

        let regionsData: any[] = []
        try {
          const { data } = await api.get('/regions')
          regionsData = data
        } catch (error: any) {
          reject(new Error(`Failed to fetch regions: ${error.message}`))
          return
        }

        const regionMap = new Map<string, string>()
        ;(regionsData || []).forEach((r: any) => {
          if (r.code) regionMap.set(r.code.toUpperCase(), r.id)
          if (r.name) regionMap.set(r.name.toUpperCase(), r.id)
        })

        const visitors: Visitor[] = []
        const errors: string[] = []

        rows.forEach((row, index) => {
          try {
            const id = String(row['ID'] || row['id'] || row['Id'] || '').trim()
            const wilayahCode = String(row['Wilayah'] || row['wilayah'] || '').trim().toUpperCase()
            let role = String(row['Role'] || row['role'] || '').trim().toLowerCase()

            // Normalize role variations (handle "Etoser" → "etoser", etc)
            if (role === 'etoser' || role === 'Etoser' || role === 'ETOSER') {
              role = 'etoser'
            } else if (role === 'mitra' || role === 'Mitra' || role === 'MITRA' || role === 'cabang' || role === 'Cabang' || role === 'CABANG') {
              role = 'mitra'
            } else if (role === 'fasil' || role === 'Fasil' || role === 'FASIL' || role === 'mentor' || role === 'Mentor' || role === 'MENTOR') {
              role = 'fasil'
            }

            // Validation
            if (!id) {
              errors.push(`Row ${index + 2}: ID is required`)
              return
            }
            if (!wilayahCode) {
              errors.push(`Row ${index + 2}: Wilayah is required`)
              return
            }

            const regionId = regionMap.get(wilayahCode)
            if (!regionId) {
              errors.push(`Row ${index + 2}: Kode wilayah "${wilayahCode}" tidak ditemukan. Gunakan: ${Array.from(regionMap.keys()).join(', ')}`)
              return
            }

            if (!role || !['etoser', 'mitra', 'fasil'].includes(role)) {
              errors.push(`Row ${index + 2}: Role must be etoser, mitra, or fasil (case-insensitive)`)
              return
            }

            visitors.push({
              id,
              regionId,
              role: role as 'etoser' | 'mitra' | 'fasil',
            })
          } catch (error) {
            errors.push(`Row ${index + 2}: Failed to parse row`)
          }
        })

        resolve({
          visitors,
          errors,
        })
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${(error as Error).message}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsArrayBuffer(file)
  })
}

export const downloadCandidateTemplate = () => {
  const template = [
    {
      ID: '001',
      Nama: 'Ahmad Rizki Pratama',
      JenisKelamin: 'Laki-laki',
      Wilayah: 'DKI Jakarta',
      Kampus: 'Universitas Indonesia',
      Prodi: 'Teknik Informatika',
      UKT: 'Rp 2.000.000',
    },
    {
      ID: '002',
      Nama: 'Siti Nurhaliza Wijaya',
      JenisKelamin: 'Perempuan',
      Wilayah: 'Jawa Barat',
      Kampus: 'Institut Teknologi Bandung',
      Prodi: 'Sistem Informasi',
      UKT: 'Rp 1.500.000',
    },
    {
      ID: '003',
      Nama: 'Budi Santoso',
      JenisKelamin: 'Laki-laki',
      Wilayah: 'Jawa Timur',
      Kampus: 'Universitas Airlangga',
      Prodi: 'Manajemen',
      UKT: 'Rp 1.000.000',
    },
  ]

  const ws = XLSX.utils.json_to_sheet(template)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Kandidat')

  // Auto-size columns
  ws['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 25 }, { wch: 15 }]

  XLSX.writeFile(wb, 'template-kandidat.xlsx')
}

export const parseScheduleExcelFile = async (file: File): Promise<ParsedScheduleData> => {
  return new Promise(async (resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]

        if (!worksheet) {
          reject(new Error('No worksheet found in Excel file'))
          return
        }

        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet)

        if (rows.length === 0) {
          reject(new Error('Excel file is empty'))
          return
        }

        let regionsData: any[] = []
        try {
          const { data } = await api.get('/regions')
          regionsData = data
        } catch (error: any) {
          reject(new Error(`Failed to fetch regions: ${error.message}`))
          return
        }

        const regionMap = new Map<string, string>()
        ;(regionsData || []).forEach((r: any) => {
          if (r.code) regionMap.set(r.code.toUpperCase(), r.id)
          if (r.name) regionMap.set(r.name.toUpperCase(), r.id)
        })

        const schedules: ParsedScheduleData['schedules'] = []
        const errors: string[] = []

        rows.forEach((row, index) => {
          try {
            const wilayahCode = String(row['Wilayah'] || row['wilayah'] || row['Region'] || row['region'] || '').trim().toUpperCase()
            const date = String(row['TanggalHomeVisit'] || row['tanggalHomeVisit'] || row['Tanggal'] || row['Date'] || '').trim()
            const etoserId = String(row['IDVisitorEtoser'] || row['idVisitorEtoser'] || row['Etoser'] || '').trim()
            const mitraId = String(row['IDVisitorMitra'] || row['idVisitorMitra'] || row['IDVisitorCabang'] || row['idVisitorCabang'] || row['Mitra'] || row['Cabang'] || '').trim()
            const fasilId = String(row['IDVisitorFasil'] || row['idVisitorFasil'] || row['IDVisitorMentor'] || row['idVisitorMentor'] || row['Fasil'] || row['Mentor'] || '').trim()
            const daftarKandidatStr = String(row['DaftarKandidat'] || row['daftarKandidat'] || row['Kandidat'] || '').trim()

            // Validation
            if (!wilayahCode) {
              errors.push(`Row ${index + 2}: Wilayah (kode) is required`)
              return
            }

            const regionId = regionMap.get(wilayahCode)
            if (!regionId) {
              errors.push(`Row ${index + 2}: Kode wilayah "${wilayahCode}" tidak ditemukan. Gunakan: ${Array.from(regionMap.keys()).join(', ')}`)
              return
            }

            if (!date) {
              errors.push(`Row ${index + 2}: TanggalHomeVisit is required`)
              return
            }

            // Validate date format (YYYY-MM-DD)
            if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
              errors.push(`Row ${index + 2}: TanggalHomeVisit must be in YYYY-MM-DD format`)
              return
            }

            if (!daftarKandidatStr) {
              errors.push(`Row ${index + 2}: DaftarKandidat is required (comma-separated IDs)`)
              return
            }

            // Parse candidate IDs (comma-separated)
            const candidateIds = daftarKandidatStr
              .split(',')
              .map((id) => id.trim())
              .filter((id) => id.length > 0)

            if (candidateIds.length === 0) {
              errors.push(`Row ${index + 2}: DaftarKandidat must contain at least one candidate ID`)
              return
            }

            // At least one visitor should be provided
            if (!etoserId && !mitraId && !fasilId) {
              errors.push(`Row ${index + 2}: Minimal 1 visitor ID harus diisi (Etoser, Mitra, atau Fasil)`)
              return
            }

            schedules.push({
              regionId: regionId,
              interview_date: date,
              etoser_id: etoserId || undefined,
              mitra_id: mitraId || undefined,
              fasil_id: fasilId || undefined,
              status: 'belum',
              candidate_ids: candidateIds,
            })
          } catch (error) {
            errors.push(`Row ${index + 2}: Failed to parse row`)
          }
        })

        resolve({
          schedules,
          errors,
        })
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${(error as Error).message}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsArrayBuffer(file)
  })
}

export const downloadVisitorTemplate = () => {
  const template = [
    {
      ID: 'vis-001',
      Wilayah: 'DKI Jakarta',
      Role: 'etoser',
    },
    {
      ID: 'vis-002',
      Wilayah: 'Jawa Barat',
      Role: 'etoser',
    },
    {
      ID: 'vis-003',
      Wilayah: 'DKI Jakarta',
      Role: 'mitra',
    },
    {
      ID: 'vis-004',
      Wilayah: 'Jawa Timur',
      Role: 'mitra',
    },
    {
      ID: 'vis-005',
      Wilayah: 'DKI Jakarta',
      Role: 'fasil',
    },
    {
      ID: 'vis-006',
      Wilayah: 'Jawa Barat',
      Role: 'fasil',
    },
  ]

  const ws = XLSX.utils.json_to_sheet(template)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Visitor')

  // Auto-size columns
  ws['!cols'] = [{ wch: 12 }, { wch: 25 }, { wch: 12 }]

  // Add info sheet dengan penjelasan
  const infoData = [
    ['Format Data Visitor'],
    [],
    ['Kolom yang diperlukan:'],
    ['- ID: Identifier unik (contoh: vis-001, vis-002, vis-003)'],
    ['- Wilayah: Kode wilayah atau Nama wilayah (contoh: LKT, DKI Jakarta)'],
    ['- Role: etoser, mitra, atau fasil (LOWERCASE)'],
    [],
    ['Catatan:'],
    ['- Gunakan format ID yang konsisten (vis-001, bukan vis-01)'],
    ['- Role HARUS lowercase: etoser, mitra, fasil'],
  ]

  const infoWs = XLSX.utils.aoa_to_sheet(infoData)
  infoWs['!cols'] = [{ wch: 80 }]
  XLSX.utils.book_append_sheet(wb, infoWs, 'Info')

  XLSX.writeFile(wb, 'template-visitor.xlsx')
}

export const parseInstrumentCSVFile = (file: File): Promise<ParsedInstrumentData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string
        const lines = csv.trim().split('\n')

        if (lines.length < 2) {
          reject(new Error('CSV file is empty or has only headers'))
          return
        }

        // Skip header line
        const dataLines = lines.slice(1)
        const instruments: Instrument[] = []
        const errors: string[] = []

        dataLines.forEach((line, index) => {
          try {
            // Parse CSV line (handle quoted fields)
            const parts: string[] = []
            let current = ''
            let inQuotes = false

            for (let i = 0; i < line.length; i++) {
              const char = line[i]
              if (char === '"') {
                inQuotes = !inQuotes
              } else if (char === ',' && !inQuotes) {
                parts.push(current.trim())
                current = ''
              } else {
                current += char
              }
            }
            parts.push(current.trim())
              if (parts.length < 1) {
                errors.push(`Row ${index + 2}: Insufficient columns (expected at least Pertanyaan)`)
                return
              }

              const id = parts[0]?.trim() || ''
              const pertanyaan = parts[1]?.trim() || ''

              if (!pertanyaan) {
                errors.push(`Row ${index + 2}: Pertanyaan is required`)
                return
              }

              instruments.push({
                id: id || `inst-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                pertanyaan,
                type: 'likert', // Default to likert for old CSV format
                urutan: instruments.length + 1,
              })
            } catch (error) {
              errors.push(`Row ${index + 2}: Failed to parse row`)
            }
          })

        resolve({
          instruments,
          errors,
        })
      } catch (error) {
        reject(new Error(`Failed to parse CSV file: ${(error as Error).message}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsText(file)
  })
}

export const parseInstrumentExcelFile = (file: File): Promise<ParsedInstrumentData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]

        if (!worksheet) {
          reject(new Error('No worksheet found in Excel file'))
          return
        }

        const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet)

        if (rows.length === 0) {
          reject(new Error('Excel file is empty'))
          return
        }

        const instruments: Instrument[] = []
        const errors: string[] = []

        rows.forEach((row, index) => {
          try {
            const id = String(row['ID'] || row['id'] || '').trim()
            const pertanyaan = String(row['Pertanyaan'] || row['pertanyaan'] || '').trim()
            const keterangan = String(row['Keterangan'] || row['keterangan'] || '').trim().toLowerCase()
            const typeValue = String(row['Type'] || row['type'] || '').trim().toLowerCase()
            
            // Infer type: if explicit Type column is 'essay' or Keterangan contains 'esai'/'essay'
            const type = (typeValue === 'essay' || typeValue === 'esai' || keterangan.includes('esai') || keterangan.includes('essay')) ? 'essay' : 'likert'

            if (!pertanyaan) {
              errors.push(`Row ${index + 2}: Pertanyaan is required`)
              return
            }

            // Generate ID if not provided
            const instrId = id || `inst-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

            instruments.push({
              id: instrId,
              pertanyaan,
              type,
              urutan: index + 1,
            })
          } catch (error) {
            errors.push(`Row ${index + 2}: Failed to parse row`)
          }
        })

        resolve({
          instruments,
          errors,
        })
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${(error as Error).message}`))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsArrayBuffer(file)
  })
}

export const downloadScheduleTemplate = () => {
  const template = [
    {
      Wilayah: 'DKI Jakarta',
      TanggalHomeVisit: '2026-06-01',
      IDVisitorEtoser: 'vis-001',
      IDVisitorMitra: 'vis-003',
      IDVisitorFasil: 'vis-005',
      DaftarKandidat: '001,002,003',
    },
    {
      Wilayah: 'Jawa Barat',
      TanggalHomeVisit: '2026-06-02',
      IDVisitorEtoser: 'vis-002',
      IDVisitorMitra: 'vis-004',
      IDVisitorFasil: 'vis-006',
      DaftarKandidat: '004,005',
    },
    {
      Wilayah: 'Jawa Timur',
      TanggalHomeVisit: '2026-06-03',
      IDVisitorEtoser: 'vis-001',
      IDVisitorMitra: 'vis-003',
      IDVisitorFasil: 'vis-005',
      DaftarKandidat: '001,002',
    },
  ]

  const ws = XLSX.utils.json_to_sheet(template)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Jadwal')

  // Auto-size columns
  ws['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 25 }]

  // Add info sheet dengan mapping region code
  const infoData = [
    ['Format Jadwal Home Visit'],
    [],
    ['Kolom yang diperlukan:'],
    ['- Wilayah: Kode wilayah (3 huruf) - lihat tabel mapping di bawah'],
    ['- TanggalHomeVisit: Format YYYY-MM-DD (contoh: 2026-06-01)'],
    ['- IDVisitorEtoser: ID dari data visitor dengan role etoser (contoh: vis-001)'],
    ['- IDVisitorMitra: ID dari data visitor dengan role mitra (contoh: vis-003)'],
    ['- IDVisitorFasil: ID dari data visitor dengan role fasil (contoh: vis-005)'],
    ['- DaftarKandidat: Comma-separated list ID kandidat (contoh: 001,002,003)'],
    [],
    ['MAPPING WILAYAH:'],
    ['Code | Nama Wilayah'],
    ['LKT  | LANGKAT'],
    ['PKB  | PEKANBARU'],
    ['DMI  | DUMAI'],
    ['PDG  | PADANG'],
    ['PLB  | PALEMBANG'],
    ['BGR  | BOGOR'],
    ['YGY  | YOGYAKARTA'],
    ['SBY  | SURABAYA'],
    ['SNJ  | SINJAI'],
    ['PDJ  | PIDIE JAYA'],
    ['AUT  | ACEH UTARA'],
    [],
    ['PENTING:'],
    ['1. Wilayah HARUS pakai KODE (LKT, PKB, DMI, dst) - lihat mapping di atas'],
    ['2. Visitor IDs HARUS ada di Data Visitor (format: vis-001, vis-002, dll)'],
    ['3. Candidate IDs HARUS ada di Data Kandidat (format: 001, 002, dll)'],
    ['4. TanggalHomeVisit format HARUS YYYY-MM-DD (tahun-bulan-tanggal)'],
    ['5. Jangan gunakan spasi setelah koma pada DaftarKandidat, atau keduanya ok'],
  ]

  const infoWs = XLSX.utils.aoa_to_sheet(infoData)
  infoWs['!cols'] = [{ wch: 80 }]
  XLSX.utils.book_append_sheet(wb, infoWs, 'Info')

  XLSX.writeFile(wb, 'template-jadwal-home_visit.xlsx')
}

export const downloadInstrumentTemplate = () => {
  const template = [
    {
      ID: 'a1',
      Bagian: 'A. VERIFIKASI DATA SOSIAL-EKONOMI & KELAYAKAN ADMINISTRATIF',
      Aspek: 'Pendapatan & Tanggungan Keluarga',
      Pertanyaan: 'Cross-check pendapatan orang tua/wali atau pihak yang menanggung biaya hidup peserta. Berapa total pendapatan bulanan keluarga dan berapa jumlah anggota keluarga yang ditanggung dari pendapatan tersebut?',
      Indikator: 'Bandingkan nominal yang disebutkan dengan dokumen pendukung (slip gaji/SKTM/surat keterangan RT-RW). Hitung pendapatan per kapita untuk menilai kewajaran klaim ekonomi lemah.',
      Pilihan: 'Sesuai; Tidak Sesuai',
      Keterangan: '-',
    },
    {
      ID: 'b1',
      Bagian: 'B. PRESENTASI DIRI, WAWASAN & KEMAMPUAN KOMUNIKASI',
      Aspek: 'Pemahaman & Kejelasan Tujuan Hidup',
      Pertanyaan: 'Bagaimana Anda menjelaskan cita-cita Anda dalam jangka pendek (1-2 tahun), menengah (saat kuliah), dan panjang (setelah lulus)? Bagaimana keterkaitan cita-cita tersebut dengan kontribusi Anda pada masyarakat sekitar?',
      Indikator: 'Mampu menjelaskan cita-cita jangka pendek-menengah-panjang dengan jelas & terencana, serta mengaitkannya dengan kontribusi sosial.',
      Pilihan: '3',
      Keterangan: 'Skoring',
    },
    {
      ID: 'b2',
      Bagian: 'B. PRESENTASI DIRI, WAWASAN & KEMAMPUAN KOMUNIKASI',
      Aspek: 'Pemahaman & Kejelasan Tujuan Hidup',
      Pertanyaan: 'Bagaimana Anda menjelaskan cita-cita Anda dalam jangka pendek (1-2 tahun), menengah (saat kuliah), dan panjang (setelah lulus)? Bagaimana keterkaitan cita-cita tersebut dengan kontribusi Anda pada masyarakat sekitar?',
      Indikator: 'Memiliki cita-cita namun belum mengaitkannya dengan kontribusi sosial-masyarakat.',
      Pilihan: '2',
      Keterangan: 'Skoring',
    },
    {
      ID: 'b3',
      Bagian: 'B. PRESENTASI DIRI, WAWASAN & KEMAMPUAN KOMUNIKASI',
      Aspek: 'Pemahaman & Kejelasan Tujuan Hidup',
      Pertanyaan: 'Bagaimana Anda menjelaskan cita-cita Anda dalam jangka pendek (1-2 tahun), menengah (saat kuliah), dan panjang (setelah lulus)? Bagaimana keterkaitan cita-cita tersebut dengan kontribusi Anda pada masyarakat sekitar?',
      Indikator: 'Belum memiliki cita-cita yang jelas.',
      Pilihan: '1',
      Keterangan: 'Skoring',
    },
  ]

  const ws = XLSX.utils.json_to_sheet(template)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Instrumen')

  // Auto-size columns
  ws['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 25 }, { wch: 45 }, { wch: 45 }, { wch: 15 }, { wch: 15 }]

  // Add info sheet
  const infoData = [
    ['Format Instrumen HomeVisit Baru'],
    [],
    ['Kolom yang diperlukan:'],
    ['- ID: Identifier unik instrumen (contoh: a1, b1, b2, dll)'],
    ['- Bagian: Dimulai dengan "A" (Kualifikasi Wajib) atau "B" (Kualifikasi Pendukung)'],
    ['- Aspek: Judul/kategori aspek yang dinilai'],
    ['- Pertanyaan: Deskripsi pertanyaan panduan untuk visitor'],
    ['- Indikator: Kriteria penilaian atau deskripsi indikator rubrik'],
    ['- Pilihan: Untuk Bagian A: Opsi jawaban (dipisahkan titik koma, contoh: Ya; Tidak atau Sesuai; Tidak Sesuai). Untuk Bagian B: Skor (contoh: 3, 2, 1)'],
    ['- Keterangan: Catatan tambahan atau jenis penanganan logic (contoh: Skoring, dll)'],
  ]

  const infoWs = XLSX.utils.aoa_to_sheet(infoData)
  infoWs['!cols'] = [{ wch: 80 }]
  XLSX.utils.book_append_sheet(wb, infoWs, 'Info')

  XLSX.writeFile(wb, 'template-instrumen.xlsx')
}


