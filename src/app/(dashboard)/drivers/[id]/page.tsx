import DriverDetailsClient from "./DriverDetailsClient";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function DriverDetailsPage() {
  return <DriverDetailsClient />;
}
