import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from '@/shell/Layout'
import { useSession } from '@/lib/store'
import { ROLE_HOME } from '@/lib/roles'
import Login from '@/routes/Login'
import Inquire from '@/routes/Inquire'
import Landing from '@/routes/Landing'

import AdminDashboard from '@/modules/admin/Dashboard'
import AdminUsers from '@/modules/admin/UserManagement'
import AdminAnnouncements from '@/modules/admin/Announcements'
import AdminReports from '@/modules/admin/Reports'

import RegistrarHome from '@/modules/registrar/index'
import AccountingHome from '@/modules/accounting/index'
import TeacherHome from '@/modules/teacher/index'
import StudentHome from '@/modules/student/index'
import MaintenanceHome from '@/modules/maintenance/index'
import MarketingHome from '@/modules/marketing/index'
import HRHome from '@/modules/hr/index'

function HomeRoute() {
  const { loggedIn, role } = useSession()
  if (loggedIn) return <Navigate to={ROLE_HOME[role]} replace />
  return <Landing />
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const loggedIn = useSession((s) => s.loggedIn)
  if (!loggedIn) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/login" element={<Login />} />
      <Route path="/inquire" element={<Inquire />} />

      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        <Route path="/admin/reports" element={<AdminReports />} />

        <Route path="/registrar/*" element={<RegistrarHome />} />
        <Route path="/accounting/*" element={<AccountingHome />} />
        <Route path="/teacher/*" element={<TeacherHome />} />
        <Route path="/student/*" element={<StudentHome />} />
        <Route path="/maintenance/*" element={<MaintenanceHome />} />
        <Route path="/marketing/*" element={<MarketingHome />} />
        <Route path="/hr/*" element={<HRHome />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
