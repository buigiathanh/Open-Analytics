export type GlobeVisualStyle = {
  dark: number;
  diffuse: number;
  mapBrightness: number;
  baseColor: [number, number, number];
  markerColor: [number, number, number];
  glowColor: [number, number, number];
};

const DARK_GLOBE: GlobeVisualStyle = {
  dark: 1,
  diffuse: 1.35,
  mapBrightness: 7.5,
  baseColor: [0.28, 0.34, 0.48],
  markerColor: [0.25, 0.92, 0.72],
  glowColor: [0.35, 0.45, 0.7],
};

const DARK_IMMERSIVE: GlobeVisualStyle = {
  dark: 1,
  diffuse: 1.4,
  mapBrightness: 8,
  baseColor: [0.3, 0.36, 0.5],
  markerColor: [0.35, 0.95, 0.78],
  glowColor: [0.4, 0.52, 0.78],
};

export function getGlobeStyle(
  immersive: boolean,
  isDark: boolean
): GlobeVisualStyle {
  if (isDark) {
    return immersive ? DARK_IMMERSIVE : DARK_GLOBE;
  }

  if (!immersive) {
    return {
      dark: 0,
      diffuse: 1.2,
      mapBrightness: 6,
      baseColor: [0.88, 0.9, 0.95],
      markerColor: [0.1, 0.55, 0.4],
      glowColor: [0.9, 0.92, 1],
    };
  }

  return {
    dark: 0,
    diffuse: 1.15,
    mapBrightness: 5.5,
    baseColor: [0.9, 0.92, 0.96],
    markerColor: [0.15, 0.55, 0.75],
    glowColor: [0.82, 0.88, 0.98],
  };
}
