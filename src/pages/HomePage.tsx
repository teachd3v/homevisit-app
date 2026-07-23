import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'

const ADMIN_PASSWORD = 'admin123'

export default function HomePage() {
  const navigate = useNavigate()
  const setRole = useAuthStore((state) => state.setRole)

  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const handleSelectRole = (selectedRole: 'admin' | 'etoser' | 'mitra' | 'fasil') => {
    if (selectedRole === 'admin') {
      if (sessionStorage.getItem('admin_authenticated') === 'true') {
        setRole('admin')
        navigate('/admin')
      } else {
        setShowPasswordModal(true)
      }
      return
    }

    setRole(selectedRole)
    // Redirect ke visitor selection page
    navigate('/visitor/select')
  }

  const handleAdminPasswordSubmit = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      // Password benar, set role admin dan navigate
      sessionStorage.setItem('admin_authenticated', 'true')
      setShowPasswordModal(false)
      setRole('admin')
      navigate('/admin')
    } else {
      // Password salah
      setPasswordError('Password salah! Silakan coba lagi.')
      setAdminPassword('')
    }
  }

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false)
    setAdminPassword('')
    setPasswordError(null)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative premium gradient circles */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] aspect-square rounded-full bg-emerald-50/50 filter blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] aspect-square rounded-full bg-amber-50/50 filter blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-block bg-emerald-50 text-emerald-600 font-bold px-3 py-1 rounded-full text-xs mb-3 border border-emerald-100">
            F-C3.2-3-09/Rev. 04
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Home Visit App</h1>
          <p className="text-slate-500 text-sm mt-1">Platform Digitalisasi Seleksi & Survey Lapangan</p>
        </div>

        <p className="text-center text-slate-500 mb-6 text-sm font-semibold uppercase tracking-wider">
          Pilih Peran Anda
        </p>

        <div className="grid grid-cols-2 gap-4">
          {/* Admin Card */}
          <button
            onClick={() => handleSelectRole('admin')}
            className="bg-white border border-slate-100 rounded-xl shadow-sm p-5 hover:border-emerald-500 hover:shadow-md active:scale-95 transition-all text-center flex flex-col items-center justify-center gap-2"
          >
            <div className="text-4xl bg-amber-50 w-16 h-16 rounded-full flex items-center justify-center shadow-inner">👨‍💼</div>
            <h2 className="text-base font-bold text-slate-800">Admin</h2>
          </button>

          {/* Etoser Card */}
          <button
            onClick={() => handleSelectRole('etoser')}
            className="bg-white border border-slate-100 rounded-xl shadow-sm p-5 hover:border-emerald-500 hover:shadow-md active:scale-95 transition-all text-center flex flex-col items-center justify-center gap-2"
          >
            <div className="text-4xl bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center shadow-inner">🧑‍🎓</div>
            <h2 className="text-base font-bold text-slate-800">Etoser</h2>
          </button>

          {/* Mitra Card */}
          <button
            onClick={() => handleSelectRole('mitra')}
            className="bg-white border border-slate-100 rounded-xl shadow-sm p-5 hover:border-emerald-500 hover:shadow-md active:scale-95 transition-all text-center flex flex-col items-center justify-center gap-2"
          >
            <div className="text-4xl bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center shadow-inner">🏢</div>
            <h2 className="text-base font-bold text-slate-800">Mitra</h2>
          </button>

          {/* Fasil Card */}
          <button
            onClick={() => handleSelectRole('fasil')}
            className="bg-white border border-slate-100 rounded-xl shadow-sm p-5 hover:border-emerald-500 hover:shadow-md active:scale-95 transition-all text-center flex flex-col items-center justify-center gap-2"
          >
            <div className="text-4xl bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center shadow-inner">🏛️</div>
            <h2 className="text-base font-bold text-slate-800">Fasil</h2>
          </button>
        </div>

        <p className="text-center text-slate-400 text-xs mt-10">
          Home Visit App v1.0 | Platform Seleksi Etos ID
        </p>
      </div>

      {/* Password Modal untuk Admin */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">🔐 Admin Access</h2>
            <p className="text-gray-600 text-sm mb-6">Masukkan password untuk mengakses admin panel</p>

            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {passwordError}
              </div>
            )}

            <div className="mb-6">
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAdminPasswordSubmit()
                  }
                }}
                placeholder="Masukkan password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClosePasswordModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleAdminPasswordSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Masuk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


