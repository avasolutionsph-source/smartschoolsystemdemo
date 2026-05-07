import { Route, Routes } from 'react-router-dom'
import TeacherDashboard from './Dashboard'
import TeacherClasses from './Classes'
import TeacherAttendance from './Attendance'
import TeacherGrades from './Grades'

export default function TeacherHome() {
  return (
    <Routes>
      <Route index element={<TeacherDashboard />} />
      <Route path="classes" element={<TeacherClasses />} />
      <Route path="attendance" element={<TeacherAttendance />} />
      <Route path="grades" element={<TeacherGrades />} />
    </Routes>
  )
}
