const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  VN: "Vietnam",
  GB: "United Kingdom",
  IN: "India",
  DE: "Germany",
  FR: "France",
  BR: "Brazil",
  JP: "Japan",
  CN: "China",
  AU: "Australia",
  CA: "Canada",
  NL: "Netherlands",
  BD: "Bangladesh",
  PE: "Peru",
  RW: "Rwanda",
  KR: "South Korea",
  SG: "Singapore",
  TH: "Thailand",
  ID: "Indonesia",
  PH: "Philippines",
  MX: "Mexico",
  ES: "Spain",
  IT: "Italy",
  PL: "Poland",
  RU: "Russia",
  UA: "Ukraine",
  TR: "Turkey",
  SA: "Saudi Arabia",
  AE: "United Arab Emirates",
};

export function countryName(code: string | null): string {
  if (!code) return "Unknown";
  const upper = code.toUpperCase();
  return COUNTRY_NAMES[upper] ?? upper;
}

/** Regional indicator symbols from ISO 3166-1 alpha-2 */
export function countryFlag(code: string | null): string {
  if (!code || code.length !== 2) return "🌐";
  const upper = code.toUpperCase();
  const a = 0x1f1e6 + (upper.charCodeAt(0) - 65);
  const b = 0x1f1e6 + (upper.charCodeAt(1) - 65);
  return String.fromCodePoint(a, b);
}

export function referrerHost(referrer: string | null): string {
  if (!referrer) return "Direct";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer.slice(0, 80);
  }
}
