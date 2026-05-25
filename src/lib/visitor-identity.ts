const ADJECTIVES = [
  "apricot",
  "tomato",
  "brave",
  "lucky",
  "swift",
  "cosmic",
  "golden",
  "silent",
  "curious",
  "mystic",
  "velvet",
  "amber",
  "coral",
  "jade",
  "silver",
  "crimson",
  "gentle",
  "wild",
  "sunny",
  "frosty",
];

const ANIMALS = [
  "deer",
  "tiglon",
  "fox",
  "panda",
  "otter",
  "falcon",
  "whale",
  "lynx",
  "badger",
  "heron",
  "koala",
  "rabbit",
  "tiger",
  "eagle",
  "wolf",
  "moose",
  "gecko",
  "yak",
  "crane",
  "bison",
];

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/** Deterministic fun name per visitor (e.g. "apricot deer") */
export function visitorDisplayName(visitorId: string): string {
  const h = hashId(visitorId);
  const adj = ADJECTIVES[h % ADJECTIVES.length];
  const animal = ANIMALS[Math.floor(h / ADJECTIVES.length) % ANIMALS.length];
  return `${adj} ${animal}`;
}

/** Cartoon-style avatar (Dicebear adventurer) — stable per visitor */
export function visitorAvatarUrl(visitorId: string, size = 80): string {
  const seed = encodeURIComponent(visitorId);
  return `https://api.dicebear.com/9.x/adventurer/png?seed=${seed}&size=${size}`;
}

export type VisitorStatusColor = "blue" | "red" | "emerald" | "white";

export function visitorStatusColor(visitorId: string): VisitorStatusColor {
  const colors: VisitorStatusColor[] = ["blue", "red", "emerald", "white"];
  return colors[hashId(visitorId) % colors.length];
}
