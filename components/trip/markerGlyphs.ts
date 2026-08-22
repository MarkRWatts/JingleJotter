// Raw HTML for the Leaflet map's marker badges — plain strings, not React,
// since Leaflet's L.divIcon renders its `html` option outside React's tree
// (this module has zero framework/DOM imports so it's safe to import from
// both the client-only map component and the legend that mirrors it).
//
// Glyph paths are lifted from lucide-react's bed-double, utensils,
// train-front, ticket, and map-pin icons (same 24x24 viewBox/stroke
// conventions used everywhere else in the app), so the map's badges read as
// the same iconography as the itinerary rows, just recoloured per type.

import type { TripItemType } from "@/lib/trip";

const GLYPH_PATHS: Record<TripItemType, string> = {
  HOTEL:
    '<path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 4v6"/><path d="M2 18h20"/>',
  MEAL: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  TRAVEL:
    '<path d="M8 3.1V7a4 4 0 0 0 8 0V3.1"/><path d="m9 15-1-1"/><path d="m15 15 1-1"/><path d="M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z"/><path d="m8 19-2 3"/><path d="m16 19 2 3"/>',
  ACTIVITY:
    '<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>',
  OTHER:
    '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
};

/** Same palette named in app/globals.css's :root — hex, not CSS vars, since
 *  this HTML is handed to Leaflet/dangerouslySetInnerHTML rather than
 *  Tailwind-classed. */
export const MARKER_TYPE_COLORS: Record<TripItemType, string> = {
  HOTEL: "#1f6b45", // pine
  MEAL: "#d9382e", // berry
  TRAVEL: "#4a3728", // cocoa
  ACTIVITY: "#e9a63c", // amber
  OTHER: "#8a715c", // cocoa-soft
};

/** A circular badge — coloured disc, white ring + drop shadow, holding a
 *  small white glyph for the item type. Used both as the Leaflet marker
 *  icon (`size` 28) and, shrunk down, as the legend swatch underneath. */
export function markerBadgeHtml(type: TripItemType, size = 28): string {
  const glyphSize = Math.round(size * 0.5);
  return `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${MARKER_TYPE_COLORS[type]};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;box-sizing:border-box;"><svg width="${glyphSize}" height="${glyphSize}" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${GLYPH_PATHS[type]}</svg></div>`;
}
