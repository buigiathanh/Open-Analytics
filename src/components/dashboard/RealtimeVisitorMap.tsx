"use client";

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useTheme } from "next-themes";
import "leaflet/dist/leaflet.css";
import { countryName } from "@/lib/countries";
import {
  visitorStatusColor,
  type VisitorStatusColor,
} from "@/lib/visitor-identity";
import type { GlobeVisitor } from "@/lib/visitor-globe-data";

const FOCUS_ZOOM = 8;
const FLY_DURATION = 1.25;

const STATUS_RING: Record<VisitorStatusColor, string> = {
  blue: "#3b82f6",
  red: "#ef4444",
  emerald: "#34d399",
  white: "#ffffff",
};

function buildAvatarIcon(visitor: GlobeVisitor, selected: boolean) {
  const status = visitorStatusColor(visitor.id);
  const size = selected ? 56 : 44;
  const ring = STATUS_RING[status];
  const ringStyle = selected
    ? `box-shadow:0 0 0 2px ${ring},0 0 0 4px #fff,0 4px 14px rgba(0,0,0,0.35)`
    : "box-shadow:0 2px 10px rgba(0,0,0,0.28)";

  return L.divIcon({
    className: "oa-avatar-leaflet-icon",
    html: `<div class="oa-avatar-marker-pin" style="width:${size}px;height:${size}px">
      <img src="${visitor.avatar.replace(/"/g, "&quot;")}" alt="" width="${size}" height="${size}"
        style="width:100%;height:100%;border-radius:50%;border:2px solid #fff;object-fit:cover;${ringStyle};transition:width 0.2s,height 0.2s,box-shadow 0.2s" />
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function fitAllVisitors(map: L.Map, visitors: GlobeVisitor[]) {
  if (visitors.length === 0) {
    map.setView([20, 0], 2);
    return;
  }
  if (visitors.length === 1) {
    map.flyTo(visitors[0].location, 4, { duration: FLY_DURATION });
    return;
  }
  const lats = visitors.map((v) => v.location[0]);
  const lngs = visitors.map((v) => v.location[1]);
  map.flyToBounds(
    [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)],
    ],
    { duration: FLY_DURATION, padding: [48, 48] }
  );
}

function MapFocus({
  selectedVisitorId,
  visitors,
}: {
  selectedVisitorId: string | null;
  visitors: GlobeVisitor[];
}) {
  const map = useMap();
  const prevSelected = useRef<string | null>(null);

  useEffect(() => {
    if (selectedVisitorId) {
      const visitor = visitors.find((v) => v.id === selectedVisitorId);
      if (visitor) {
        map.flyTo(visitor.location, FOCUS_ZOOM, {
          duration: FLY_DURATION,
          easeLinearity: 0.25,
        });
      }
      prevSelected.current = selectedVisitorId;
      return;
    }

    if (prevSelected.current != null) {
      fitAllVisitors(map, visitors);
    }
    prevSelected.current = null;
  }, [selectedVisitorId, visitors, map]);

  return null;
}

function InitialBounds({ visitors }: { visitors: GlobeVisitor[] }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (fitted.current || visitors.length === 0) return;
    fitted.current = true;
    fitAllVisitors(map, visitors);
  }, [visitors, map]);

  return null;
}

function AvatarMarker({
  visitor,
  selected,
  onSelect,
}: {
  visitor: GlobeVisitor;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const markerRef = useRef<L.Marker | null>(null);
  const icon = useMemo(
    () => buildAvatarIcon(visitor, selected),
    [visitor, selected]
  );

  useEffect(() => {
    if (selected) {
      markerRef.current?.openPopup();
    } else {
      markerRef.current?.closePopup();
    }
  }, [selected]);

  const flagCode =
    visitor.countryCode.length === 2 ? visitor.countryCode : "xx";

  return (
    <Marker
      ref={markerRef}
      position={visitor.location}
      icon={icon}
      zIndexOffset={selected ? 1000 : 0}
      eventHandlers={{
        click: () => onSelect(visitor.id),
      }}
    >
      {selected && (
        <Popup closeButton={false} offset={[0, -8]}>
          <div className="min-w-[140px] text-left text-xs">
            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
              {visitor.displayName}
            </p>
            <p className="truncate font-mono text-[10px] text-zinc-500">
              {visitor.path}
            </p>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-zinc-500">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://flagcdn.com/w20/${flagCode}.png`}
                alt=""
                width={14}
                height={10}
                className="h-2.5 w-3.5 shrink-0 rounded-[1px] object-cover"
              />
              <span className="truncate">
                {visitor.country || countryName(visitor.countryCode)}
              </span>
            </div>
            <p className="mt-0.5 truncate text-[9px] text-zinc-400">
              {visitor.browserLabel} · {visitor.deviceLabel} · {visitor.source}
            </p>
          </div>
        </Popup>
      )}
    </Marker>
  );
}

interface RealtimeVisitorMapProps {
  visitors: GlobeVisitor[];
  selectedVisitorId: string | null;
  onSelectedVisitorChange: (id: string | null) => void;
}

export function RealtimeVisitorMap({
  visitors,
  selectedVisitorId,
  onSelectedVisitorChange,
}: RealtimeVisitorMapProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (
      selectedVisitorId &&
      !visitors.some((v) => v.id === selectedVisitorId)
    ) {
      onSelectedVisitorChange(null);
    }
  }, [selectedVisitorId, visitors, onSelectedVisitorChange]);

  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  const orderedVisitors = useMemo(() => {
    if (!selectedVisitorId) return visitors;
    return [
      ...visitors.filter((v) => v.id !== selectedVisitorId),
      ...visitors.filter((v) => v.id === selectedVisitorId),
    ];
  }, [visitors, selectedVisitorId]);

  return (
    <div className="h-full w-full [&_.leaflet-container]:h-full [&_.leaflet-container]:z-0">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO'
          url={tileUrl}
        />
        {selectedVisitorId == null && <InitialBounds visitors={visitors} />}
        <MapFocus
          selectedVisitorId={selectedVisitorId}
          visitors={visitors}
        />
        {orderedVisitors.map((v) => (
          <AvatarMarker
            key={v.id}
            visitor={v}
            selected={selectedVisitorId === v.id}
            onSelect={onSelectedVisitorChange}
          />
        ))}
      </MapContainer>
    </div>
  );
}
