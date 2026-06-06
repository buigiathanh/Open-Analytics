"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import L from "leaflet";
import { Marker, Polygon, useMap } from "react-leaflet";
import { useTheme } from "next-themes";

const PALETTE = {
  light: {
    sea: "#D4DADC",
    islandFill: "#FAFAF8",
    islandBorder: "#E8E8E4",
    label: "#ABB6BE",
  },
  dark: {
    sea: "#262626",
    islandFill: "#090909",
    islandBorder: "#1a1a1a",
    label: "#444444",
  },
} as const;

type IslandDef = {
  center: [number, number];
  shape: number;
  scale?: number;
};

const HOANG_SA_ISLANDS: IslandDef[] = [
  { center: [15.783, 111.2], shape: 0, scale: 0.9 },
  { center: [16.05, 111.517], shape: 1, scale: 1.1 },
  { center: [16.183, 111.683], shape: 2, scale: 1 },
  { center: [16.217, 111.967], shape: 3, scale: 0.85 },
  { center: [16.333, 111.75], shape: 4, scale: 0.75 },
  { center: [16.45, 112.05], shape: 5, scale: 0.8 },
  { center: [16.567, 112.717], shape: 0, scale: 0.95 },
  { center: [16.733, 112.517], shape: 1, scale: 0.7 },
  { center: [16.833, 112.333], shape: 2, scale: 1.3 },
  { center: [17.1, 112.283], shape: 3, scale: 1 },
  { center: [16.617, 111.883], shape: 4, scale: 0.65 },
  { center: [16.15, 112.15], shape: 5, scale: 0.6 },
];

const TRUONG_SA_ISLANDS: IslandDef[] = [
  { center: [7.367, 113.683], shape: 0, scale: 0.7 },
  { center: [7.883, 112.883], shape: 1, scale: 0.85 },
  { center: [8.2, 113.55], shape: 2, scale: 0.75 },
  { center: [8.633, 111.917], shape: 3, scale: 1.2 },
  { center: [8.883, 114.383], shape: 4, scale: 0.9 },
  { center: [8.933, 114.483], shape: 5, scale: 0.85 },
  { center: [9.0, 113.5], shape: 0, scale: 0.7 },
  { center: [9.55, 112.883], shape: 1, scale: 1.1 },
  { center: [9.883, 114.217], shape: 2, scale: 1 },
  { center: [10.383, 114.367], shape: 3, scale: 1.15 },
  { center: [10.75, 114.233], shape: 4, scale: 0.8 },
  { center: [10.833, 114.233], shape: 5, scale: 0.75 },
  { center: [11.05, 114.283], shape: 0, scale: 1 },
  { center: [11.083, 114.217], shape: 1, scale: 0.9 },
  { center: [10.2, 115.5], shape: 2, scale: 0.65 },
];

/** Vùng loại trừ đảo Hải Nam (Trung Quốc) — layout biển không phủ lên đảo. */
const HAINAN_BOUNDS = {
  south: 18.0,
  north: 20.25,
  west: 108.45,
  east: 111.1,
};

/** Giới hạn trên layout biển = cực nam đảo Hải Nam. */
const SEA_NORTH_LIMIT = HAINAN_BOUNDS.south;

/** Giới hạn dưới — phía bắc Brunei / Borneo (~4.9°N). */
const SEA_SOUTH_LIMIT = 7.0;

/** Giới hạn đông vùng nam — tránh Brunei (~115°E). */
const SEA_EAST_LIMIT_SOUTH = 115.0;

/** Giới hạn đông layout giữa & phía bắc. */
const SEA_EAST_LIMIT_MIDDLE = 116.8;

/** Chỉ dịch vùng biển giữa — đảo giữ nguyên tọa độ thực. */
const MIDDLE_SEA_LAT_OFFSET = 0.8;
const MIDDLE_SEA_LNG_OFFSET = 2.5;

/** Vùng biển nối giữa quần đảo Hoàng Sa (phía trên) và Trường Sa (phía dưới). */
const MIDDLE_SEA_ZONE: L.LatLngExpression[] = [
  [15.55 + MIDDLE_SEA_LAT_OFFSET, 110.55 + MIDDLE_SEA_LNG_OFFSET],
  [15.55 + MIDDLE_SEA_LAT_OFFSET, 113.05 + MIDDLE_SEA_LNG_OFFSET],
  [
    11.85 + MIDDLE_SEA_LAT_OFFSET,
    Math.min(116.25 + MIDDLE_SEA_LNG_OFFSET, SEA_EAST_LIMIT_MIDDLE),
  ],
  [11.85 + MIDDLE_SEA_LAT_OFFSET, 110.75 + MIDDLE_SEA_LNG_OFFSET],
];

/**
 * Đường cực đông đất liền Việt Nam (vĩ độ giảm dần về phía nam).
 * Điểm cực đông: Mũi Đại Lãnh ~12.93°N, 109.47°E.
 */
const VIETNAM_EAST_COAST: [number, number][] = [
  [21.5, 107.55],
  [20.5, 107.72],
  [19.5, 107.82],
  [18.5, 107.92],
  [17.5, 108.02],
  [16.5, 108.18],
  [15.5, 108.45],
  [14.5, 108.92],
  [13.5, 109.28],
  [12.926, 109.47],
  [12.0, 109.38],
  [11.0, 109.32],
  [10.0, 109.38],
  [9.0, 109.44],
  [8.0, 109.5],
  [7.0, 109.52],
  [6.0, 109.38],
  [5.5, 109.18],
];

/** Đệm phía đông so với bờ biển để tránh đè lên đất liền. */
const COAST_BUFFER_LNG = 2.15;

const HAINAN_BUFFER = 0.1;

/** Layout biển & nhãn hai quần đảo khi zoom đủ gần. */
const SEA_LAYOUT_MIN_ZOOM = 4;
const ISLAND_LABEL_MIN_ZOOM = 5;

const EAST_SEA_LAT_BANDS = [SEA_SOUTH_LIMIT, 8, 11.85, 15.55, SEA_NORTH_LIMIT];
const EAST_SEA_LNG_BANDS = [107.8, 110.5, 113, 115.5, SEA_EAST_LIMIT_MIDDLE];

function vietnamEastCoastLng(lat: number): number {
  const pts = VIETNAM_EAST_COAST;
  if (lat >= pts[0][0]) return pts[0][1];
  if (lat <= pts[pts.length - 1][0]) return pts[pts.length - 1][1];

  for (let i = 0; i < pts.length - 1; i++) {
    const [latNorth, lngNorth] = pts[i];
    const [latSouth, lngSouth] = pts[i + 1];
    if (lat <= latNorth && lat >= latSouth) {
      const t = (lat - latSouth) / (latNorth - latSouth);
      return lngSouth + t * (lngNorth - lngSouth);
    }
  }

  return 109.47;
}

function vietnamEastBoundLng(lat: number): number {
  return vietnamEastCoastLng(lat) + COAST_BUFFER_LNG;
}

function rectSeaZone(
  south: number,
  west: number,
  north: number,
  east: number
): L.LatLngExpression[] {
  return [
    [north, west],
    [north, east],
    [south, east],
    [south, west],
  ];
}

/** Mép trái = cực đông nhất của VN trong dải vĩ độ (lấy mẫu dày). */
function eastBoundForLatBand(south: number, north: number): number {
  let maxLng = -Infinity;
  const step = 0.1;
  for (let lat = south; lat <= north; lat += step) {
    maxLng = Math.max(maxLng, vietnamEastBoundLng(lat));
  }
  return Math.max(maxLng, vietnamEastBoundLng(north));
}

type SeaRect = [south: number, west: number, north: number, east: number];

function rectsOverlap(a: SeaRect, b: SeaRect): boolean {
  const [s1, w1, n1, e1] = a;
  const [s2, w2, n2, e2] = b;
  return s1 < n2 && n1 > s2 && w1 < e2 && e1 > w2;
}

function excludeHainanFromRect(rect: SeaRect): SeaRect[] {
  const [south, west, north, east] = rect;
  const hainan: SeaRect = [
    HAINAN_BOUNDS.south - HAINAN_BUFFER,
    HAINAN_BOUNDS.west - HAINAN_BUFFER,
    HAINAN_BOUNDS.north + HAINAN_BUFFER,
    HAINAN_BOUNDS.east + HAINAN_BUFFER,
  ];

  if (!rectsOverlap(rect, hainan)) return [rect];

  const [hS, hW, hN, hE] = hainan;
  const pieces: SeaRect[] = [];

  if (north > hN) pieces.push([hN, west, north, east]);
  if (south < hS) pieces.push([south, west, hS, east]);

  const midSouth = Math.max(south, hS);
  const midNorth = Math.min(north, hN);
  if (midSouth < midNorth) {
    if (west < hW) pieces.push([midSouth, west, midNorth, hW]);
    if (east > hE) pieces.push([midSouth, hE, midNorth, east]);
  }

  return pieces.filter(([s, w, n, e]) => s < n && w < e);
}

function eastLimitForLatBand(south: number, north: number): number {
  return north <= 11.85 ? SEA_EAST_LIMIT_SOUTH : SEA_EAST_LIMIT_MIDDLE;
}

function pushSeaZones(
  zones: L.LatLngExpression[][],
  south: number,
  north: number,
  west: number,
  east: number,
  eastLimit = eastLimitForLatBand(south, north)
) {
  const cappedSouth = Math.max(south, SEA_SOUTH_LIMIT);
  const cappedNorth = Math.min(north, SEA_NORTH_LIMIT);
  const cappedEast = Math.min(east, eastLimit);
  if (cappedSouth >= cappedNorth) return;

  const clippedWest = Math.max(
    west,
    eastBoundForLatBand(cappedSouth, cappedNorth)
  );
  if (clippedWest >= cappedEast) return;

  for (const rect of excludeHainanFromRect([
    cappedSouth,
    clippedWest,
    cappedNorth,
    cappedEast,
  ])) {
    zones.push(rectSeaZone(...rect));
  }
}

/** Nhiều cụm layout phủ Biển Đông (không che VN & Hải Nam), giữ vùng giữa đã căn chỉnh. */
function buildEastSeaZones(): L.LatLngExpression[][] {
  const zones: L.LatLngExpression[][] = [];

  for (let row = 0; row < EAST_SEA_LAT_BANDS.length - 1; row++) {
    const south = EAST_SEA_LAT_BANDS[row];
    const north = EAST_SEA_LAT_BANDS[row + 1];
    const isMiddleBand = south === 11.85 && north === 15.55;

    for (let col = 0; col < EAST_SEA_LNG_BANDS.length - 1; col++) {
      const west = EAST_SEA_LNG_BANDS[col];
      const east = EAST_SEA_LNG_BANDS[col + 1];

      if (isMiddleBand) {
        if (col === 0) {
          pushSeaZones(zones, south, north, west, 110.55, SEA_EAST_LIMIT_MIDDLE);
          continue;
        }
        if (col === 1) {
          zones.push(MIDDLE_SEA_ZONE);
          continue;
        }
        if (col === EAST_SEA_LNG_BANDS.length - 2) {
          pushSeaZones(
            zones,
            south + MIDDLE_SEA_LAT_OFFSET,
            north + MIDDLE_SEA_LAT_OFFSET,
            116.25 + MIDDLE_SEA_LNG_OFFSET,
            east,
            SEA_EAST_LIMIT_MIDDLE
          );
          continue;
        }
        continue;
      }

      pushSeaZones(zones, south, north, west, east);
    }
  }

  return zones;
}

const EAST_SEA_ZONES = buildEastSeaZones();

const HOANG_SA_LABEL: [number, number] = [16.45, 111.55];
const TRUONG_SA_LABEL: [number, number] = [9.2, 113.35];

const SHAPE_OFFSETS: [number, number][][] = [
  [
    [0.9, -0.45],
    [0.35, 0.75],
    [-0.55, 0.55],
    [-0.75, -0.25],
    [-0.15, -0.85],
  ],
  [
    [0.75, -0.6],
    [0.55, 0.5],
    [-0.35, 0.8],
    [-0.8, 0.1],
    [-0.5, -0.65],
  ],
  [
    [0.6, -0.7],
    [0.8, 0.2],
    [0.2, 0.85],
    [-0.7, 0.45],
    [-0.65, -0.5],
  ],
  [
    [0.85, -0.3],
    [0.4, 0.65],
    [-0.45, 0.7],
    [-0.85, -0.15],
    [-0.3, -0.75],
  ],
  [
    [0.7, -0.55],
    [0.65, 0.35],
    [-0.2, 0.75],
    [-0.75, 0.3],
    [-0.55, -0.6],
  ],
  [
    [0.55, -0.65],
    [0.75, 0.45],
    [-0.4, 0.6],
    [-0.8, -0.2],
    [-0.25, -0.7],
  ],
];

const SEA_PANE = "oa-sea-pane";
const ISLAND_PANE = "oa-islands-pane";

function useMapPanesReady() {
  const map = useMap();
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const seaPane = map.getPane(SEA_PANE) ?? map.createPane(SEA_PANE);
    seaPane.style.zIndex = "410";

    const islandPane = map.getPane(ISLAND_PANE) ?? map.createPane(ISLAND_PANE);
    islandPane.style.zIndex = "420";

    setReady(true);
  }, [map]);

  return ready;
}

function seaZonePathOptions(isDark: boolean): L.PathOptions {
  const sea = isDark ? PALETTE.dark.sea : PALETTE.light.sea;
  return {
    color: sea,
    weight: 0,
    fillColor: sea,
    fillOpacity: 1,
  };
}

/** Fixed geographic size (degrees) — Leaflet scales on screen when zooming. */
const ISLAND_BASE_SIZE_DEG = 0.035;

function buildIslandPolygon(
  center: [number, number],
  shape: number,
  scale: number
): L.LatLngExpression[] {
  const [lat, lng] = center;
  const size = ISLAND_BASE_SIZE_DEG * scale;
  const offsets = SHAPE_OFFSETS[shape % SHAPE_OFFSETS.length];

  return offsets.map(([dy, dx]) => [lat + dy * size, lng + dx * size]);
}

function islandPathOptions(isDark: boolean): L.PathOptions {
  const palette = isDark ? PALETTE.dark : PALETTE.light;
  return {
    color: palette.islandBorder,
    weight: 1,
    fillColor: palette.islandFill,
    fillOpacity: 1,
  };
}

function clusterLabelIcon(label: string, isDark: boolean) {
  const color = isDark ? PALETTE.dark.label : PALETTE.light.label;
  const lightOutline =
    "-1px -1px 0 #fff,1px -1px 0 #fff,-1px 1px 0 #fff,1px 1px 0 #fff,0 -1px 0 #fff,0 1px 0 #fff,-1px 0 0 #fff,1px 0 0 #fff";
  const textStyle = isDark
    ? `color:${color}`
    : `color:${color};text-shadow:${lightOutline}`;
  return L.divIcon({
    className: "oa-island-label-icon",
    html: `<span style="display:inline-block;font-size:10px;font-weight:700;letter-spacing:0.03em;white-space:nowrap;${textStyle}">${label}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 12],
  });
}

function IslandPolygons({
  islands,
  isDark,
}: {
  islands: IslandDef[];
  isDark: boolean;
}) {
  const pathOptions = useMemo(() => islandPathOptions(isDark), [isDark]);

  return (
    <>
      {islands.map((island, i) => (
        <Polygon
          key={i}
          pane={ISLAND_PANE}
          positions={buildIslandPolygon(
            island.center,
            island.shape,
            island.scale ?? 1
          )}
          pathOptions={pathOptions}
          interactive={false}
        />
      ))}
    </>
  );
}

function VietnamIslandsGeographicLayer({ isDark }: { isDark: boolean }) {
  const map = useMap();
  const panesReady = useMapPanesReady();
  const [zoom, setZoom] = useState(map.getZoom());
  const seaOptions = useMemo(() => seaZonePathOptions(isDark), [isDark]);

  useEffect(() => {
    const sync = () => setZoom(map.getZoom());
    map.on("zoom", sync);
    map.on("zoomend", sync);
    return () => {
      map.off("zoom", sync);
      map.off("zoomend", sync);
    };
  }, [map]);

  const showSeaLayout = zoom >= SEA_LAYOUT_MIN_ZOOM;
  const showLabels = zoom >= ISLAND_LABEL_MIN_ZOOM;

  if (!panesReady) return null;

  return (
    <>
      {showSeaLayout &&
        EAST_SEA_ZONES.map((zone, i) => (
          <Polygon
            key={`sea-${i}`}
            pane={SEA_PANE}
            positions={zone}
            pathOptions={seaOptions}
            interactive={false}
          />
        ))}
      <IslandPolygons islands={HOANG_SA_ISLANDS} isDark={isDark} />
      <IslandPolygons islands={TRUONG_SA_ISLANDS} isDark={isDark} />
      {showLabels && (
        <>
          <Marker
            position={HOANG_SA_LABEL}
            icon={clusterLabelIcon("Hoang Sa", isDark)}
            interactive={false}
            zIndexOffset={400}
          />
          <Marker
            position={TRUONG_SA_LABEL}
            icon={clusterLabelIcon("Truong Sa", isDark)}
            interactive={false}
            zIndexOffset={400}
          />
        </>
      )}
    </>
  );
}

/** Leaflet layer: per-cluster sea zones + islands at real coordinates. */
export function VietnamIslandsMapLayer() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return <VietnamIslandsGeographicLayer isDark={isDark} />;
}
