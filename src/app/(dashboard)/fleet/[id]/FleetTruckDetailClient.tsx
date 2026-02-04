"use client";

import { Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { TruckDetailView } from "@/app/modules/fleet/ui/views/truck-detail-view";
import { useEffect } from "react";

function FleetTruckDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  // Support both path param (for web) and query param (for Capacitor static export)
  const id = searchParams.get("id") || (params.id as string);

  useEffect(() => {
    if (!id || id === "placeholder") {
      router.replace("/fleet");
      return;
    }
  }, [id, router]);

  if (!id || id === "placeholder") {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return <TruckDetailView id={id} />;
}

export default function FleetTruckDetailClient() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <FleetTruckDetailContent />
    </Suspense>
  );
}
