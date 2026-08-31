import { createFileRoute } from "@tanstack/react-router";
import AuditLogsPage from "../../pages/AuditLogsPage";

export const Route = createFileRoute("/dashboard/audit-logs")({
  component: AuditLogsPage,
});
