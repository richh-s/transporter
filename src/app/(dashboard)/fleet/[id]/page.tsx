import FleetTruckDetailClient from "./FleetTruckDetailClient";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function TruckDetailPage() {
  return <FleetTruckDetailClient />;
}
