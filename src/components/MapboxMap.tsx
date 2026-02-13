"use client";

import { useEffect, useRef } from "react";
import { Box } from "@chakra-ui/react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { publicEnv } from "@/lib/env";

interface MapboxMapProps {
  pickup?: { lat: number; lng: number };
  delivery?: { lat: number; lng: number };
}

export function MapboxMap({ pickup, delivery }: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    if (!publicEnv.MAPBOX_TOKEN) return;

    mapboxgl.accessToken = publicEnv.MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-1.5, 53.0], // UK centre
      zoom: 5.5,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when coordinates change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers by class
    document
      .querySelectorAll(".vanjet-marker")
      .forEach((el) => el.remove());

    const bounds = new mapboxgl.LngLatBounds();

    if (pickup) {
      new mapboxgl.Marker({ color: "#0070f3" })
        .setLngLat([pickup.lng, pickup.lat])
        .setPopup(new mapboxgl.Popup().setHTML("<b>Pickup</b>"))
        .addTo(map)
        .getElement()
        .classList.add("vanjet-marker");
      bounds.extend([pickup.lng, pickup.lat]);
    }

    if (delivery) {
      new mapboxgl.Marker({ color: "#e53e3e" })
        .setLngLat([delivery.lng, delivery.lat])
        .setPopup(new mapboxgl.Popup().setHTML("<b>Delivery</b>"))
        .addTo(map)
        .getElement()
        .classList.add("vanjet-marker");
      bounds.extend([delivery.lng, delivery.lat]);
    }

    if (pickup && delivery) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 13 });
    } else if (pickup || delivery) {
      const point = pickup || delivery;
      if (point) map.flyTo({ center: [point.lng, point.lat], zoom: 12 });
    }
  }, [pickup, delivery]);

  return (
    <Box
      ref={mapContainer}
      borderRadius="xl"
      overflow="hidden"
      height={{ base: "280px", md: "400px" }}
      width="100%"
      borderWidth="1px"
      borderColor="gray.200"
    />
  );
}
