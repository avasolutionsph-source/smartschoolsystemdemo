import { Route, Routes } from 'react-router-dom'
import MaintenanceDashboard from './Dashboard'
import MaintenanceTickets from './Tickets'
import MaintenanceAssets from './Assets'

export default function MaintenanceHome() {
  return (
    <Routes>
      <Route index element={<MaintenanceDashboard />} />
      <Route path="tickets" element={<MaintenanceTickets />} />
      <Route path="assets" element={<MaintenanceAssets />} />
    </Routes>
  )
}
