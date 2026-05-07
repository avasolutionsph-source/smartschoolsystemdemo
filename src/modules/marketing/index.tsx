import { Route, Routes } from 'react-router-dom'
import MarketingDashboard from './Dashboard'
import MarketingLeads from './Leads'
import MarketingPromos from './Promos'

export default function MarketingHome() {
  return (
    <Routes>
      <Route index element={<MarketingDashboard />} />
      <Route path="leads" element={<MarketingLeads />} />
      <Route path="promos" element={<MarketingPromos />} />
    </Routes>
  )
}
