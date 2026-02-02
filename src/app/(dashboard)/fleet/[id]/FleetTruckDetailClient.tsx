"use client";

import { useParams } from "next/navigation";
import { TruckDetailView } from "@/app/modules/fleet/ui/views/truck-detail-view";

export default function FleetTruckDetailClient() {
  const params = useParams();
  const id = params.id as string;
  return <TruckDetailView id={id} />;
}
