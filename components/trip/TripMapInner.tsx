"use client";

// The actual Leaflet map — touches `window` at import time, so this file is
// only ever loaded via next/dynamic({ ssr: false }) from TripMap.tsx. Never
// import this directly from a server component.

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { markerBadgeHtml } from "./markerGlyphs";
import type { MapMarkerData } from "./types";

const LONDON_FALLBACK_CENTER: [number, number] = [51.5074, -0.1278];

/** Adjusts the map's view once markers are known — a plain Leaflet call
 *  inside an effect, not a prop, since react-leaflet only reads
 *  center/zoom on first mount. */
function FitBounds({ markers }: { markers: MapMarkerData[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) return;
    if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lng], 14);
      return;
    }
    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [24, 24] });
  }, [markers, map]);

  return null;
}

export default function TripMapInner({ markers }: { markers: MapMarkerData[] }) {
  // One divIcon per type — cheap to build (a handful of markers at most),
  // so no memoisation needed; skips fighting the hooks linter over a
  // derived-from-array-contents dependency.
  const iconByType = new Map<MapMarkerData["type"], L.DivIcon>();
  for (const m of markers) {
    if (iconByType.has(m.type)) continue;
    iconByType.set(
      m.type,
      L.divIcon({
        className: "",
        html: markerBadgeHtml(m.type),
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16],
      }),
    );
  }

  const initialCenter: [number, number] =
    markers.length > 0 ? [markers[0].lat, markers[0].lng] : LONDON_FALLBACK_CENTER;

  return (
    <MapContainer
      center={initialCenter}
      zoom={13}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <FitBounds markers={markers} />
      {markers.map((m) => (
        <Marker key={m.id} position={[m.lat, m.lng]} icon={iconByType.get(m.type)}>
          <Popup minWidth={180}>
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-cocoa">{m.title}</p>
              {(m.venue || m.time) && (
                <p className="text-xs text-cocoa-soft">
                  {[m.time, m.venue].filter(Boolean).join(" · ")}
                </p>
              )}
              <span
                className={`mt-1 inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  m.booked
                    ? "bg-pine/15 text-pine-deep"
                    : "border border-dashed border-amber text-amber"
                }`}
              >
                {m.booked ? "Booked" : "To book"}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
