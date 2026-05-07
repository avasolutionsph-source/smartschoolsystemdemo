import { Route, Routes } from 'react-router-dom'
import AccountingDashboard from './Dashboard'
import AccountingSOA from './SOA'
import AccountingPayments from './Payments'
import AccountingReports from './Reports'

export default function AccountingHome() {
  return (
    <Routes>
      <Route index element={<AccountingDashboard />} />
      <Route path="soa" element={<AccountingSOA />} />
      <Route path="payments" element={<AccountingPayments />} />
      <Route path="reports" element={<AccountingReports />} />
    </Routes>
  )
}
