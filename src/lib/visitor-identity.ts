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

/** Local avatar pool (public/avatars/) — stable per visitor */
export const AVATAR_COUNT = 100;

export function visitorAvatarUrl(visitorId: string, _size = 80): string {
  const index = hashId(visitorId) % AVATAR_COUNT;
  return `/avatars/${index}.png`;
}

export type VisitorStatusColor = "blue" | "red" | "emerald" | "white";

export function visitorStatusColor(visitorId: string): VisitorStatusColor {
  const colors: VisitorStatusColor[] = ["blue", "red", "emerald", "white"];
  return colors[hashId(visitorId) % colors.length];
}
