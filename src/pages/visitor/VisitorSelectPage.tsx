import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useVisitorStore } from '../../store/visitorStore'

const roleEmojis: { [key: string]: string } = {
  etoser: '🧑‍🎓',
  mitra: '🏢',
  fasil: '🏛️',
}

const roleLabels: { [key: string]: string } = {
  etoser: 'Etoser',
  mitra: 'Mitra',
  fasil: 'Fasil',
}

export default function VisitorSelectPage() {
  const navigate = useNavigate()
  const role = useAuthStore((state) => state.role)
  const setVisitor = useAuthStore((state) => state.setVisitor)

  const visitors = useVisitorStore((state) => state.visitors)

  useEffect(() => {
    useVisitorStore.getState().loadFromAPI()
  }, [])

  useEffect(() => {
    // Redirect ke home jika role belum dipilih
    if (!role || role === 'admin') {
      navigate('/')
    }
  }, [role, navigate])

  const filteredVisitors = visitors.filter((visitor) => visitor.role === role)

  const handleSelectVisitor = (id: string, name: string) => {
    setVisitor(id, name)
    navigate('/visitor')
  }

  const handleBack = () => {
    navigate('/')
  }

  if (!role || role === 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Pilih Visitor</h1>
          <div className="w-9"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {roleEmojis[role]} Daftar Visitor {roleLabels[role]}
          </h2>
          <p className="text-sm text-gray-600">Pilih nama dan lanjut observasi</p>
        </div>

        {filteredVisitors.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              Belum ada visitor dengan role {roleLabels[role]}.
            </p>
            <button
              onClick={handleBack}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Kembali ke Beranda
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 md:gap-6">
            {filteredVisitors.map((visitor) => (
              <button
                key={visitor.id}
                onClick={() => handleSelectVisitor(visitor.id, visitor.name || visitor.full_name || "")}
                className="bg-white rounded-lg border border-gray-200 p-4 md:p-6 hover:shadow-lg hover:border-emerald-400 transition-all text-left flex flex-col justify-between"
              >
                <div>
                  <div className="text-2xl md:text-4xl mb-2 md:mb-4">{roleEmojis[visitor.role]}</div>
                  <h3 className="text-sm md:text-lg font-bold text-gray-900 line-clamp-2 leading-tight">{visitor.full_name || visitor.name}</h3>
                  <p className="text-[10px] md:text-sm text-gray-500 mt-1">
                    ID: {visitor.id}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}



