"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useRealtimeSocket } from "@/hooks/useRealtimeSocket";
import { ONLINE_WINDOW_MS } from "@/lib/constants";
import { getLiveVisitors } from "@/lib/stats";
import { DEVICE_LABEL } from "@/lib/constants";
import { countryName } from "@/lib/countries";
import type { AnalyticsEvent, LiveVisitor } from "@/lib/types";

interface RealtimeMapProps {
  siteKey: string;
  initialEvents: AnalyticsEvent[];
  variant?: "card" | "full";
  /** Khi set, dùng events từ parent (tránh subscribe trùng) */
  externalEvents?: AnalyticsEvent[];
}

function FitBounds({ visitors }: { visitors: LiveVisitor[] }) {
  const map = useMap();
  useEffect(() => {
    const withCoords = visitors.filter(
      (v) => v.latitude != null && v.longitude != null
    );
    if (withCoords.length === 0) {
      map.setView([20, 0], 2);
      return;
    }
    if (withCoords.length === 1) {
      map.setView([withCoords[0].latitude!, withCoords[0].longitude!], 5);
      return;
    }
    const lats = withCoords.map((v) => v.latitude!);
    const lngs = withCoords.map((v) => v.longitude!);
    map.fitBounds([
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ]);
  }, [visitors, map]);
  return null;
}

function PulsingMarker({
  lat,
  lng,
  path,
  device,
  countryCode,
  lastSeen,
}: {
  lat: number;
  lng: number;
  path: string | null;
  device: number | null;
  countryCode: string | null;
  lastSeen: string;
}) {
  return (
    <CircleMarker
      center={[lat, lng]}
      radius={10}
      pathOptions={{
        color: "#059669",
        fillColor: "#10b981",
        fillOpacity: 0.9,
        weight: 2,
      }}
      className="oa-pulse-marker"
    >
      <Popup>
        <div className="text-xs">
          <p className="font-medium">{path || "/"}</p>
          <p className="text-zinc-600">
            {DEVICE_LABEL[device ?? 0]} · {countryName(countryCode)}
          </p>
          <p className="text-zinc-400">
            {new Date(lastSeen).toLocaleTimeString()}
          </p>
        </div>
      </Popup>
    </CircleMarker>
  );
}

export function RealtimeMap({
  siteKey,
  initialEvents,
  variant = "card",
  externalEvents,
}: RealtimeMapProps) {
  const [internalEvents, setInternalEvents] = useState(initialEvents);
  const events = externalEvents ?? internalEvents;
  const managedExternally = externalEvents != null;
  const managedRef = useRef(managedExternally);
  managedRef.current = managedExternally;

  useRealtimeSocket(siteKey, (event) => {
    if (managedRef.current) return;
    setInternalEvents((prev) => [event, ...prev].slice(0, 500));
  });

  const live = useMemo(
    () => getLiveVisitors(events, ONLINE_WINDOW_MS),
    [events]
  );

  const tileUrl =
    variant === "full"
      ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const heightClass = variant === "full" ? "h-full w-full" : "h-[320px] w-full";

  const map = (
    <MapContainer
      center={[20, 0]}
      zoom={variant === "full" ? 2 : 2}
      className={heightClass}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO'
        url={tileUrl}
      />
      <FitBounds visitors={live} />
      {live.map((v) => {
        const lat = v.latitude ?? countryFallback(v.country_code)?.[0];
        const lng = v.longitude ?? countryFallback(v.country_code)?.[1];
        if (lat == null || lng == null) return null;
        return (
          <PulsingMarker
            key={v.visitor_id}
            lat={lat}
            lng={lng}
            path={v.path}
            device={v.device}
            countryCode={v.country_code}
            lastSeen={v.last_seen}
          />
        );
      })}
    </MapContainer>
  );

  if (variant === "full") {
    return <div className="h-full w-full [&_.leaflet-container]:h-full">{map}</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Realtime
        </h3>
        <span className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          {live.length} online
        </span>
      </div>
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        {map}
      </div>
    </div>
  );
}

function countryFallback(code: string | null): [number, number] | null {
  const centers: Record<string, [number, number]> = {
    US: [39.8, -98.5],
    VN: [21.0, 105.8],
    GB: [55.4, -3.4],
    DE: [51.2, 10.5],
    FR: [46.2, 2.2],
    JP: [36.2, 138.3],
    IN: [20.6, 78.9],
    BR: [-14.2, -51.9],
    AU: [-25.3, 133.8],
  };
  if (!code) return null;
  return centers[code.toUpperCase()] ?? null;
}
