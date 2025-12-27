import { FleetView } from "@/app/modules/fleet/ui/views/fleet-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fleet Management | WeTruck",
  description: "Manage your trucks and fleet capacity.",
};

export default function FleetPage() {
  return <FleetView />;
}
