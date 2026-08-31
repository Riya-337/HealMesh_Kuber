import { type ReactNode } from 'react'
import Sidebar from './Sidebar'
import DashboardNavbar from './DashboardNavbar'
import IncidentDrawer from '../incident/IncidentDrawer'
import ChaosLabDock from '../chaos/ChaosLabDock'

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden aurora-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <DashboardNavbar />
        <main className="flex-1 overflow-auto relative">
          {children}
          <IncidentDrawer />
          <ChaosLabDock />
        </main>
      </div>
    </div>
  )
}
