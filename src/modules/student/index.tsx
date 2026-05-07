import { Route, Routes } from 'react-router-dom'
import StudentDashboard from './Dashboard'
import StudentSchedule from './Schedule'
import StudentGrades from './Grades'
import StudentSOA from './SOA'
import StudentDocuments from './Documents'
import StudentProfile from './Profile'

export default function StudentHome() {
  return (
    <Routes>
      <Route index element={<StudentDashboard />} />
      <Route path="schedule" element={<StudentSchedule />} />
      <Route path="grades" element={<StudentGrades />} />
      <Route path="soa" element={<StudentSOA />} />
      <Route path="documents" element={<StudentDocuments />} />
      <Route path="profile" element={<StudentProfile />} />
    </Routes>
  )
}
