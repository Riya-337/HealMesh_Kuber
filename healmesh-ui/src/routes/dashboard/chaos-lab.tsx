import { createFileRoute } from "@tanstack/react-router";
import ChaosLabPage from "../../pages/ChaosLabPage";

export const Route = createFileRoute("/dashboard/chaos-lab")({
  component: ChaosLabPage,
});
