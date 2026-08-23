/** London "usuals" — trip traditions offered on the trip page while the
 *  trip is to London and the itinerary doesn't already include them (see
 *  the `match` check in app/trip/page.tsx). Icons live client-side in
 *  components/trip/TraditionCard.tsx, keyed by `key`. */
export const TRADITIONS = [
  {
    key: "truefitt",
    label: "Haircut & shave at Truefitt & Hill",
    title: "Haircut & shave",
    venue: "Truefitt & Hill, St James's",
    // Geocoded from the street address (venue stays the friendly display name).
    address: "71 St James's Street, London SW1A 1PH",
    match: "truefitt",
  },
  {
    key: "townhouse",
    label: "Manicure at Townhouse, Harrods",
    title: "Manicure",
    venue: "Townhouse, Harrods, Knightsbridge",
    address: "87-135 Brompton Road, Knightsbridge, London SW1X 7XL",
    match: "townhouse",
  },
] as const;

export type Tradition = (typeof TRADITIONS)[number];
export type TraditionKey = Tradition["key"];
