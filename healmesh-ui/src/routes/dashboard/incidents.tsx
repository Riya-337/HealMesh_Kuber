import { createFileRoute } from "@tanstack/react-router";
import IncidentsPage from "../../pages/IncidentsPage";

export const Route = createFileRoute("/dashboard/incidents")({
  component: IncidentsPage,
});
