import { Route, Routes } from 'react-router-dom'
import HRDashboard from './Dashboard'
import HREmployees from './Employees'
import HRPayroll from './Payroll'
import HRAttendance from './Attendance'

export default function HRHome() {
  return (
    <Routes>
      <Route index element={<HRDashboard />} />
      <Route path="employees" element={<HREmployees />} />
      <Route path="payroll" element={<HRPayroll />} />
      <Route path="attendance" element={<HRAttendance />} />
    </Routes>
  )
}
