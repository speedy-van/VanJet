// ─── VanJet · Mapbox Geocoding + Directions (GB Only) ─────────
import { publicEnv } from "@/lib/env";

const MAPBOX_BASE = "https://api.mapbox.com";

export interface GeocodingResult {
  placeName: string;
  lat: number;
  lng: number;
}

/**
 * Forward-geocode an address string, restricted to Great Britain.
 */
export async function geocodeAddress(
  query: string
): Promise<GeocodingResult> {
  const token = publicEnv.MAPBOX_TOKEN;
  if (!token) throw new Error("Mapbox token is not configured.");

  const url = `${MAPBOX_BASE}/geocoding/v5/mapbox.places/${encodeURIComponent(
    query
  )}.json?country=GB&limit=1&access_token=${token}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding request failed.");

  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) throw new Error("Address not found. Please enter a valid UK address.");

  return {
    placeName: feature.place_name,
    lng: feature.center[0],
    lat: feature.center[1],
  };
}

export interface DirectionsResult {
  distanceKm: number;
  durationMinutes: number;
}

/**
 * Get driving distance between two coordinates.
 */
export async function getDirections(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<DirectionsResult> {
  const token = publicEnv.MAPBOX_TOKEN;
  if (!token) throw new Error("Mapbox token is not configured.");

  const url = `${MAPBOX_BASE}/directions/v5/mapbox/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false&access_token=${token}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Directions request failed.");

  const data = await res.json();
  const route = data.routes?.[0];
  if (!route) throw new Error("No route found between these addresses.");

  return {
    distanceKm: Math.round((route.distance / 1000) * 100) / 100,
    durationMinutes: Math.round(route.duration / 60),
  };
}
