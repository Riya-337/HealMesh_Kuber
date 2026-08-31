import { createFileRoute } from "@tanstack/react-router";
import RemediationPage from "../../pages/RemediationPage";

export const Route = createFileRoute("/dashboard/remediation")({
  component: RemediationPage,
});
