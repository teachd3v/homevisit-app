import { BrowserRouter, Routes, Route } from 'react-router-dom'
import GlobalLoader from './components/GlobalLoader'
import HomePage from './pages/HomePage'
import AdminDashboard from './pages/admin/AdminDashboard'
import DataKandidat from './pages/admin/DataKandidat'
import DataVisitor from './pages/admin/DataVisitor'
import DataInstrument from './pages/admin/DataInstrument'
import JadwalHomeVisit from './pages/admin/JadwalHomeVisit'
import HasilAkhir from './pages/admin/HasilAkhir'
import HasilHomeVisit from './pages/admin/HasilHomeVisit'
import HasilHomeVisitDetail from './pages/admin/HasilHomeVisitDetail'
import ValidasiHomeVisit from './pages/admin/ValidasiHomeVisit'
import VisitorDashboard from './pages/visitor/VisitorDashboard'
import VisitorSelectPage from './pages/visitor/VisitorSelectPage'
import FormHomeVisit from './pages/visitor/FormHomeVisit'
import DataWilayah from './pages/admin/DataWilayah'
import { useAuthStore } from './store/authStore'

export default function App() {
  const { role } = useAuthStore((state) => ({
    role: state.role
  }))

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <GlobalLoader />
      <Routes>
        {/* Home Page - Pilih Role */}
        <Route path="/" element={<HomePage />} />

        {/* Admin Routes */}
        {role === 'admin' && (
          <>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/kandidat" element={<DataKandidat />} />
            <Route path="/admin/wilayah" element={<DataWilayah />} />
            <Route path="/admin/visitor" element={<DataVisitor />} />
            <Route path="/admin/instrumen" element={<DataInstrument />} />
            <Route path="/admin/jadwal" element={<JadwalHomeVisit />} />
            <Route path="/admin/hasil" element={<HasilAkhir />} />
            <Route path="/admin/hasil-home-visit" element={<HasilHomeVisit />} />
            <Route path="/admin/validasi-home-visit" element={<ValidasiHomeVisit />} />
            <Route path="/admin/hasil-home-visit-detail/:id" element={<HasilHomeVisitDetail />} />
          </>
        )}

        {/* Visitor Routes */}
        {(role === 'etoser' || role === 'mitra' || role === 'fasil') && (
          <>
            <Route path="/visitor/select" element={<VisitorSelectPage />} />
            <Route path="/visitor" element={<VisitorDashboard />} />
            <Route path="/visitor/home-visit/:candidateId" element={<FormHomeVisit />} />
            <Route path="/visitor/hasil-home-visit-detail/:id" element={<HasilHomeVisitDetail />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  )
}



