import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DeskProvider } from './context/DeskContext'
import { DashboardLayout } from './layouts/DashboardLayout'
import { EnginePage } from './pages/EnginePage'
import { ExecutionPage } from './pages/ExecutionPage'
import { OverviewPage } from './pages/OverviewPage'
import { PositionsPage } from './pages/PositionsPage'

export default function App() {
  return (
    <BrowserRouter>
      <DeskProvider>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="/overview" replace />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="positions" element={<PositionsPage />} />
            <Route path="engine" element={<EnginePage />} />
            <Route path="execution" element={<ExecutionPage />} />
            <Route path="*" element={<Navigate to="/overview" replace />} />
          </Route>
        </Routes>
      </DeskProvider>
    </BrowserRouter>
  )
}
