export type GlobeVisitor = {
  id: string;
  name: string;
  displayName: string;
  avatar: string;
  location: [number, number];
  city: string;
  country: string;
  countryCode: string;
  path: string;
  deviceLabel: string;
  browserLabel: string;
  source: string;
  lastSeen: string;
  isBot?: boolean;
};

function locationToVector([lat, lng]: [number, number]): [number, number, number] {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180 - Math.PI;
  const cosLat = Math.cos(latRad);
  return [-cosLat * Math.cos(lngRad), Math.sin(latRad), cosLat * Math.sin(lngRad)];
}

export function locationToAngles(location: [number, number]) {
  const [x, , z] = locationToVector(location);
  const [lat] = location;
  return {
    phi: Math.atan2(-x, z),
    theta: (lat * Math.PI) / 180,
  };
}
