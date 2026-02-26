"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TrackingTruck, LocationLog } from "@/types/ship";
import { Truck as LegacyTruck } from "../../server/types/truck";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type MapTruck = TrackingTruck | LegacyTruck;

interface InternalTruck {
  id: string | number;
  latest: {
    lat: number;
    lng: number;
    speed: number;
    direction: number;
    is_moving: boolean;
    parking?: boolean;
    update_time?: string;
    total_distance?: number;
  };
  path: LatLngExpression[];
}

function getTruckIcon(color: string) {
  return new L.DivIcon({
    className: "",
    html: `
      <svg viewBox="0 0 24 24" width="32" height="32" style="transform: rotate(0deg);">
        <path
          d="M3 7h11v6h5l2 3v3h-2a2 2 0 0 1-4 0H9a2 2 0 0 1-4 0H3v-8z"
          fill="${color}"
        />
        <circle cx="7" cy="19" r="2" fill="#111827"/>
        <circle cx="17" cy="19" r="2" fill="#111827"/>
      </svg>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

const COLORS = [
  "#dc2626", // red
  "#2563eb", // blue
  "#16a34a", // green
  "#9333ea", // purple
  "#ea580c", // orange
  "#0891b2", // cyan
];

/* ---------------- Component ---------------- */

export function LiveTrackingMap({ trucks, className }: { trucks: MapTruck[], className?: string }) {
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Normalize trucks to a common format
  const normalizedTrucks: InternalTruck[] = trucks.map((t) => {
    if ("location_log" in t) {
      // It's a TrackingTruck from ship.ts
      const latestLog = t.location_log[t.location_log.length - 1];
      return {
        id: t.truck_id,
        latest: {
          lat: latestLog?.latitude ?? 0,
          lng: latestLog?.longitude ?? 0,
          speed: latestLog?.speed ? latestLog.speed / 1000 : 0, // convert to km/h if needed
          direction: latestLog?.direction ?? 0,
          is_moving: latestLog?.is_moving ?? false,
          parking: latestLog?.parking,
          update_time: latestLog?.update_time,
          total_distance: latestLog?.total_distance,
        },
        path: t.location_log.map((log) => [log.latitude, log.longitude] as LatLngExpression),
      };
    } else {
      // It's a LegacyTruck from live-tracking module
      return {
        id: t.id,
        latest: {
          lat: t.lat,
          lng: t.lng,
          speed: t.speed,
          direction: t.heading,
          is_moving: t.status === "moving",
        },
        path: [[t.lat, t.lng] as LatLngExpression],
      };
    }
  });

  const center: LatLngExpression = normalizedTrucks.length
    ? [normalizedTrucks[0].latest.lat, normalizedTrucks[0].latest.lng]
    : [9.145, 40.4896]; // Ethiopia center as fallback

  return (
    <div className={cn(
      "relative transition-all duration-300 flex flex-col",
      isFullScreen ? "fixed inset-0 z-[100] bg-background p-4" : "h-full w-full",
      className
    )}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .leaflet-control-zoom-in,
        .leaflet-control-zoom-out {
          color: #333 !important;
          background-color: #fff !important;
          border-bottom: 1px solid #ccc !important;
        }
        .leaflet-container {
          background: #f8fafc !important;
        }
      `}} />
      <div className="absolute top-4 right-4 z-[1000]">
        <Button
          variant="secondary"
          size="icon"
          className="shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => setIsFullScreen(!isFullScreen)}
        >
          {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>

      <MapContainer
        center={center}
        zoom={6}
        minZoom={2}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1.0}
        worldCopyJump={true}
        scrollWheelZoom={true}
        className="flex-1 min-h-[400px] w-full rounded-lg overflow-hidden border border-border"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          noWrap={true}
        />

        {normalizedTrucks.map((truck, index) => {
          const color = COLORS[index % COLORS.length];

          return (
            <div key={truck.id}>
              {/* Path */}
              {truck.path.length > 1 && (
                <Polyline
                  positions={truck.path}
                  pathOptions={{
                    color,
                    weight: 4,
                    opacity: 0.85,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
              )}

              {/* Marker at current/latest position */}
              <Marker
                position={[truck.latest.lat, truck.latest.lng]}
                icon={getTruckIcon(color)}
                rotationAngle={truck.latest.direction}
                rotationOrigin="center"
              >
                <Popup>
                  <div className="space-y-2 text-sm">
                    <div className="font-semibold flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                      Truck #{truck.id}
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={truck.latest.is_moving ? "default" : "secondary"}>
                        {truck.latest.is_moving ? "Moving" : "Stopped"}
                      </Badge>
                      {truck.latest.parking && (
                        <Badge variant="outline" className="border-orange-500 text-orange-600">
                          Parking
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <span className="text-muted-foreground">Speed:</span>
                      <span>{truck.latest.speed.toFixed(1)} km/h</span>
                      {truck.latest.total_distance && (
                        <>
                          <span className="text-muted-foreground">Total Dist:</span>
                          <span>{(truck.latest.total_distance / 1000).toFixed(1)} km</span>
                        </>
                      )}
                      {truck.latest.update_time && (
                        <>
                          <span className="text-muted-foreground">Last Update:</span>
                          <span>{new Date(truck.latest.update_time).toLocaleTimeString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}

