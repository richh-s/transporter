import ShipDetailsClient from "./ShipDetailsClient";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function ShipDetailsPage() {
  return <ShipDetailsClient />;
}
