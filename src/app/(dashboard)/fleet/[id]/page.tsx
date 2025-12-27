import { TruckDetailView } from "@/app/modules/fleet/ui/views/truck-detail-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Truck Details | WeTruck",
  description: "View and manage truck information",
};

interface TruckDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TruckDetailPage({ params }: TruckDetailPageProps) {
  const { id } = await params;
  return <TruckDetailView id={id} />;
}

