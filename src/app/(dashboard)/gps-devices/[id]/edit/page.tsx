import EditGPSDeviceClient from "./EditGPSDeviceClient";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: "placeholder" }];
}

export default function EditGPSDevicePage() {
  return <EditGPSDeviceClient />;
}
