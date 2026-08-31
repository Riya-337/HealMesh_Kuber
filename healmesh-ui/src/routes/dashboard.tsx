import { createFileRoute, Outlet } from "@tanstack/react-router";
import Sidebar from "@/components/layout/Sidebar";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import IncidentDrawer from "@/components/incident/IncidentDrawer";
import ChaosLabDock from "@/components/chaos/ChaosLabDock";
import UserApprovalModal from "@/components/layout/UserApprovalModal";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden aurora-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <DashboardNavbar />
        <main className="flex-1 overflow-auto relative">
          <Outlet />
          <IncidentDrawer />
          <ChaosLabDock />
          <UserApprovalModal />
        </main>
      </div>
    </div>
  );
}



