import { NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type GeoResult = {
  latitude: number | null;
  longitude: number | null;
  country_code: string | null;
};

const PROVIDERS: {
  url: string;
  parse: (data: Record<string, unknown>) => GeoResult | null;
}[] = [
  {
    url: "https://ipwho.is/",
    parse: (d) => {
      if (d.success === false) return null;
      return {
        latitude: (d.latitude as number) ?? null,
        longitude: (d.longitude as number) ?? null,
        country_code: (d.country_code as string) ?? null,
      };
    },
  },
  {
    url: "https://get.geojs.io/v1/ip/geo.json",
    parse: (d) => ({
      latitude: d.latitude != null ? parseFloat(String(d.latitude)) : null,
      longitude: d.longitude != null ? parseFloat(String(d.longitude)) : null,
      country_code: (d.country_code as string) ?? null,
    }),
  },
  {
    url: "https://reallyfreegeoip.org/json/",
    parse: (d) => ({
      latitude: (d.latitude as number) ?? null,
      longitude: (d.longitude as number) ?? null,
      country_code: (d.country_code as string) ?? null,
    }),
  },
];

function valid(geo: GeoResult | null): geo is GeoResult {
  return geo != null && geo.latitude != null && geo.longitude != null;
}

export async function GET() {
  for (const provider of PROVIDERS) {
    try {
      const res = await fetch(provider.url, {
        next: { revalidate: 0 },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) continue;
      const data = (await res.json()) as Record<string, unknown>;
      const geo = provider.parse(data);
      if (valid(geo)) {
        return NextResponse.json(
          {
            latitude: geo.latitude,
            longitude: geo.longitude,
            country_code: geo.country_code?.toUpperCase().slice(0, 2) ?? null,
          },
          { headers: CORS_HEADERS }
        );
      }
    } catch {
      /* try next provider */
    }
  }

  return NextResponse.json(
    { latitude: null, longitude: null, country_code: null },
    { headers: CORS_HEADERS }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
