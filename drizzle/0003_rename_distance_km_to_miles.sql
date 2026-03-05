-- Rename distance_km to distance_miles for clarity.
-- The column always stored driving distance in miles (from Mapbox) despite the name.
ALTER TABLE "jobs" RENAME COLUMN "distance_km" TO "distance_miles";
