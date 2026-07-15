/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'
import { mockCandidates, mockVisitors, mockSchedules } from '../mocks/data'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dummy.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY || 'dummy'
const useMock = import.meta.env.VITE_USE_MOCK === 'true'

// Helper to get or set data in localStorage for persistence in mock mode
function getLocalStorageTable(tableName: string, defaultData: any[]) {
  try {
    const data = localStorage.getItem('mock_db_' + tableName)
    if (data) {
      return JSON.parse(data)
    }
    localStorage.setItem('mock_db_' + tableName, JSON.stringify(defaultData))
    return defaultData
  } catch (e) {
    return defaultData
  }
}

function saveLocalStorageTable(tableName: string, data: any[]) {
  try {
    localStorage.setItem('mock_db_' + tableName, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
  }
}

try {
  const storedSchools = localStorage.getItem('mock_db_schools')
  if (storedSchools && !storedSchools.includes('regionId')) {
    localStorage.removeItem('mock_db_regions')
    localStorage.removeItem('mock_db_schools')
  }
} catch (e) {
  console.warn(e)
}

// In-memory data store for offline mock mode synced with localStorage
let inMemoryDB: Record<string, any[]> = {
  candidates: getLocalStorageTable('candidates', mockCandidates.map(c => ({
    id: c.id,
    full_name: c.fullName,
    campus: c.campus,
    region: c.region,
    gender: c.gender,
    major: c.major,
    home_visit_status: 'pending'
  }))),
  visitors: getLocalStorageTable('visitors', mockVisitors.map(i => ({
    id: i.id,
    full_name: i.fullName,
    role: i.role,
    region: i.region
  }))),
  interview_schedules: getLocalStorageTable('interview_schedules', mockSchedules.map(s => ({
    id: s.id,
    regionId: '1',
    interview_date: s.date,
    status: s.status,
    etoser_id: s.etoser?.id || null,
    mitra_id: s.mitra?.id || null,
    fasil_id: s.fasil?.id || null
  }))),
  schedule_candidates: getLocalStorageTable('schedule_candidates', mockSchedules.map(s => ({
    id: `link-${s.id}-${s.candidateId}`,
    schedule_id: s.id,
    candidate_id: s.candidateId
  }))),
  assessment_results: getLocalStorageTable('assessment_results', []),
  home_visit_results: getLocalStorageTable('home_visit_results', []),
  instruments: getLocalStorageTable('instruments', [
    { id: '1', urutan: 1, pertanyaan: 'Bagaimana kondisi fisik luar rumah/dinding/atap/lantai?', keterangan: 'Amati jenis bahan bangunan utama rumah tinggal.', bagian: 'A', aspek: 'Fisik', indikator: 'Dinding/Atap/Lantai', pilihan: 'Layak/Tidak Layak' },
    { id: '2', urutan: 2, pertanyaan: 'Berapakah pendapatan rata-rata gabungan orang tua per bulan?', keterangan: 'Konfirmasi bukti slip gaji atau surat keterangan penghasilan.', bagian: 'A', aspek: 'Ekonomi', indikator: 'Pendapatan', pilihan: '1jt-2jt/2jt-3jt' },
    { id: '3', urutan: 3, pertanyaan: 'Apakah keluarga memiliki cicilan atau pinjaman aktif (termasuk paylater)?', keterangan: 'Tanyakan rincian nominal bulanan dan sisa tenor.', bagian: 'B', aspek: 'Finansial', indikator: 'Cicilan', pilihan: 'Ada/Tidak' },
    { id: '4', urutan: 4, pertanyaan: 'Berapakah jumlah anak/tanggungan yang masih sekolah di keluarga?', keterangan: 'Hitung total anggota keluarga inti selain orang tua.', bagian: 'B', aspek: 'Sosial', indikator: 'Tanggungan', pilihan: '1/2/3/dst' },
    { id: '5', urutan: 5, pertanyaan: 'Bagaimana akses teknologi dan internet di rumah?', keterangan: 'Cek ketersediaan laptop, HP, dan koneksi wifi/paket data.', bagian: 'C', aspek: 'Pendidikan', indikator: 'Teknologi', pilihan: 'Ada/Tidak' }
  ]),
  regions: getLocalStorageTable('regions', [
    { id: '1', name: 'DKI Jakarta' },
    { id: '2', name: 'Jawa Barat' },
    { id: '3', name: 'Jawa Timur' },
    { id: '4', name: 'DI Yogyakarta' },
    { id: '5', name: 'Sumatera Utara' }
  ]),
  campuses: getLocalStorageTable('campuses', [
    { id: '1', name: 'Universitas Indonesia', regionId: '1' },
    { id: '2', name: 'Institut Teknologi Bandung', regionId: '2' },
    { id: '3', name: 'Universitas Airlangga', regionId: '3' },
    { id: '4', name: 'Universitas Sumatera Utara', regionId: '5' },
    { id: '5', name: 'Universitas Gadjah Mada', regionId: '4' }
  ])
};

// Mock Query Builder mimicking Supabase JS chain
class MockQueryBuilder {
  table: string;
  constructor(table: string) {
    this.table = table;
  }
  
  private createQueryChain(dataList: any[]) {
    const chain = {
      order: (field: string, options?: any) => {
        let sorted = [...dataList];
        if (options?.ascending === false) {
          sorted.sort((a, b) => b[field] > a[field] ? 1 : -1);
        } else {
          sorted.sort((a, b) => a[field] > b[field] ? 1 : -1);
        }
        return this.createQueryChain(sorted);
      },
      eq: (field: string, value: any) => {
        return this.createQueryChain(dataList.filter(item => item[field] === value));
      },
      single: () => {
        return Promise.resolve({
          data: dataList.length > 0 ? dataList[0] : null,
          error: dataList.length === 0 ? { message: 'Row not found' } : null
        });
      },
      maybeSingle: () => {
        return Promise.resolve({
          data: dataList.length > 0 ? dataList[0] : null,
          error: null
        });
      },
      then: (resolve: any) => {
        resolve({ data: dataList, error: null });
      }
    };
    return chain as any;
  }

  select(_fields?: string) {
    return this.createQueryChain(inMemoryDB[this.table] || []);
  }

  insert(data: any) {
    const rows = Array.isArray(data) ? data : [data];
    if (!inMemoryDB[this.table]) inMemoryDB[this.table] = [];
    const insertedRows: any[] = [];
    rows.forEach(r => {
      // Ensure candidate gets a valid sequential or unique ID if none provided
      const finalId = r.id || `CAND-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 100)}`;
      const newRow = { id: finalId, ...r };
      inMemoryDB[this.table].push(newRow);
      insertedRows.push(newRow);
    });
    saveLocalStorageTable(this.table, inMemoryDB[this.table]);
    
    return {
      select: () => this.createQueryChain(insertedRows),
      then: (resolve: any) => resolve({ data: insertedRows, error: null })
    } as any;
  }

  update(data: any) {
    const self = this;
    return {
      eq: (field: string, value: any) => {
        const list = inMemoryDB[self.table] || [];
        const updatedRows: any[] = [];
        list.forEach(item => {
          if (item[field] === value) {
            Object.assign(item, data);
            updatedRows.push(item);
          }
        });
        saveLocalStorageTable(self.table, inMemoryDB[self.table]);
        
        return {
          select: () => self.createQueryChain(updatedRows),
          then: (resolve: any) => resolve({ data: updatedRows, error: null })
        };
      }
    } as any;
  }

  delete() {
    const self = this;
    return {
      eq: (field: string, value: any) => {
        if (inMemoryDB[self.table]) {
          inMemoryDB[self.table] = inMemoryDB[self.table].filter(item => item[field] !== value);
        }
        saveLocalStorageTable(self.table, inMemoryDB[self.table]);
        return Promise.resolve({ error: null });
      }
    };
  }
}

// Mock storage for local testing
const getLocalStorageStorage = () => {
  try {
    const data = localStorage.getItem('mock_db_storage')
    return data ? JSON.parse(data) : {}
  } catch (e) {
    return {}
  }
}

const saveLocalStorageStorage = (data: any) => {
  try {
    localStorage.setItem('mock_db_storage', JSON.stringify(data))
  } catch (e) {
    console.error('Local storage full, cannot save image', e)
  }
}

// Mock client object
const mockSupabase = {
  from: (table: string) => new MockQueryBuilder(table),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithOAuth: () => Promise.resolve({ data: {}, error: null }),
    onAuthStateChange: (cb: any) => {
      cb('SIGNED_OUT', null);
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const base64data = reader.result
            const storage = getLocalStorageStorage()
            const fullPath = `${bucket}/${path}`
            storage[fullPath] = base64data
            saveLocalStorageStorage(storage)
            resolve({ data: { path }, error: null })
          }
          reader.readAsDataURL(file)
        })
      },
      getPublicUrl: (path: string) => {
        const storage = getLocalStorageStorage()
        const fullPath = `${bucket}/${path}`
        return { data: { publicUrl: storage[fullPath] || 'https://via.placeholder.com/150' } }
      }
    })
  }
};

// Check and initialize the client
if (!useMock && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn('Missing Supabase environment variables')
}

export const supabase = useMock 
  ? (mockSupabase as any)
  : createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })



