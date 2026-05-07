import { Route, Routes } from 'react-router-dom'
import RegistrarDashboard from './Dashboard'
import RegistrarStudents from './Students'
import RegistrarEnrollment from './Enrollment'
import RegistrarDocuments from './Documents'
import RegistrarGradesLock from './GradesLock'

export default function RegistrarHome() {
  return (
    <Routes>
      <Route index element={<RegistrarDashboard />} />
      <Route path="students" element={<RegistrarStudents />} />
      <Route path="enrollment" element={<RegistrarEnrollment />} />
      <Route path="documents" element={<RegistrarDocuments />} />
      <Route path="grades" element={<RegistrarGradesLock />} />
    </Routes>
  )
}
