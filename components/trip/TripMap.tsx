"use client";

// Small client wrapper: the real map (TripMapInner) touches `window` via
// Leaflet, which breaks server rendering, so it's loaded with
// next/dynamic({ ssr: false }) — and that option only works from inside a
// Client Component, hence this wrapper existing at all. app/trip/page.tsx
// stays a server component and just hands this plain, serialized marker data.

import dynamic from "next/dynamic";
import { TRIP_ITEM_TYPES, TRIP_ITEM_TYPE_LABELS } from "@/lib/trip";
import { markerBadgeHtml } from "./markerGlyphs";
import type { MapMarkerData } from "./types";

const TripMapInner = dynamic(() => import("./TripMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[340px] items-center justify-center text-sm text-cocoa-soft">
      Loading map…
    </div>
  ),
});

export function TripMap({ markers }: { markers: MapMarkerData[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-[340px] overflow-hidden rounded-3xl bg-white shadow-sm">
        <TripMapInner markers={markers} />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-1">
        {TRIP_ITEM_TYPES.map((type) => (
          <span key={type} className="flex items-center gap-1.5 text-xs text-cocoa-soft">
            <span
              aria-hidden="true"
              // Safe: markerBadgeHtml only ever interpolates a fixed,
              // module-defined lookup keyed by `type` — no user input.
              dangerouslySetInnerHTML={{ __html: markerBadgeHtml(type, 16) }}
            />
            {TRIP_ITEM_TYPE_LABELS[type]}
          </span>
        ))}
      </div>
    </div>
  );
}
