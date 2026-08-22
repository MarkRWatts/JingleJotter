// Venue-name → coordinates via Nominatim (OpenStreetMap's geocoder).
// Free service, usage policy: max 1 req/s, meaningful User-Agent — trivially
// satisfied by a two-user household app geocoding on item save.

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "JingleJotter/1.0 (personal household app)";

export type GeoPoint = { lat: number; lng: number };

/** Best-effort geocode of "venue, destination". Returns null on no match,
 *  network failure, or timeout — callers must treat location as optional. */
export async function geocodeVenue(
  venue: string,
  destination: string,
): Promise<GeoPoint | null> {
  const q = [venue.trim(), destination.trim()].filter(Boolean).join(", ");
  if (!q) return null;
  try {
    const url = `${NOMINATIM}?format=json&limit=1&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const results: { lat: string; lon: string }[] = await res.json();
    const hit = results[0];
    if (!hit) return null;
    const lat = parseFloat(hit.lat);
    const lng = parseFloat(hit.lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}
