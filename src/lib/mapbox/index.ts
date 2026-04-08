// ─── VanJet · Mapbox Geocoding + Directions (GB Only) ─────────
import { publicEnv } from "@/lib/env";

const MAPBOX_BASE = "https://api.mapbox.com";
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

export interface GeocodingResult {
  placeName: string;
  lat: number;
  lng: number;
}

/** Simple retry wrapper for fetch calls. */
async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;

      // Don't retry on 4xx (client error) — only on 5xx or network issues
      if (res.status >= 400 && res.status < 500) return res;

      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
      }
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (attempt + 1)));
    }
  }
  throw new Error("Fetch failed after retries.");
}

/**
 * Forward-geocode an address string, restricted to Great Britain.
 */
export async function geocodeAddress(
  query: string
): Promise<GeocodingResult> {
  const token = publicEnv.MAPBOX_TOKEN;
  if (!token) throw new Error("Mapbox token is not configured.");

  // UK mainland bounding box: SW corner to NE corner (lon,lat,lon,lat)
  const ukBbox = "-8.65,49.84,1.77,60.86";
  const url = `${MAPBOX_BASE}/geocoding/v5/mapbox.places/${encodeURIComponent(
    query
  )}.json?country=GB&bbox=${ukBbox}&language=en&types=address,postcode,place&limit=1&access_token=${token}`;

  const res = await fetchWithRetry(url);
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
  distanceMiles: number;
  durationMinutes: number;
  isFallback?: boolean;
}

/**
 * Calculate straight-line (haversine) distance between two coordinates.
 * Used as a fallback when Mapbox Directions API fails.
 * Applies a 1.3x road-factor to approximate driving distance.
 */
export function straightLineDistance(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): DirectionsResult {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const straightMiles = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Road-factor: roads are typically 1.2-1.4x straight-line distance in the UK
  const roadFactor = 1.3;
  const drivingMiles = Math.round(straightMiles * roadFactor * 100) / 100;

  // Estimate duration: average ~30 mph in UK for mixed roads
  const durationMinutes = Math.round((drivingMiles / 30) * 60);

  return {
    distanceMiles: drivingMiles,
    durationMinutes,
    isFallback: true,
  };
}

/**
 * Get driving distance between two coordinates.
 * Falls back to straight-line distance if Mapbox fails.
 */
export async function getDirections(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): Promise<DirectionsResult> {
  const token = publicEnv.MAPBOX_TOKEN;
  if (!token) {
    console.warn("[VanJet] Mapbox token not set, using straight-line fallback.");
    return straightLineDistance(from, to);
  }

  const url = `${MAPBOX_BASE}/directions/v5/mapbox/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=false&access_token=${token}`;

  try {
    const res = await fetchWithRetry(url);
    if (!res.ok) {
      console.warn("[VanJet] Mapbox Directions API failed, using straight-line fallback.");
      return straightLineDistance(from, to);
    }

    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) {
      console.warn("[VanJet] No route found, using straight-line fallback.");
      return straightLineDistance(from, to);
    }

    // Mapbox returns distance in metres — convert to miles (UK standard)
    const { metersToMiles } = await import("@/lib/utils/distance");
    return {
      distanceMiles: metersToMiles(route.distance),
      durationMinutes: Math.round(route.duration / 60),
      isFallback: false,
    };
  } catch (err) {
    console.error("[VanJet] Mapbox Directions error:", err);
    return straightLineDistance(from, to);
  }
}
