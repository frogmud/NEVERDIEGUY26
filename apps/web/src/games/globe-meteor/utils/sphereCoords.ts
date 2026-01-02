/**
 * Spherical Coordinate Utilities
 *
 * Convert between lat/lng and 3D Cartesian coordinates on a sphere.
 * Used for NPC placement and meteor targeting on the globe.
 */

import { GLOBE_CONFIG } from '../config';

/**
 * Convert latitude/longitude to 3D Cartesian coordinates on sphere surface
 *
 * @param lat - Latitude in degrees (-90 to 90)
 * @param lng - Longitude in degrees (-180 to 180)
 * @param radius - Sphere radius (defaults to globe radius)
 * @returns [x, y, z] coordinates
 */
export function latLngToCartesian(
  lat: number,
  lng: number,
  radius: number = GLOBE_CONFIG.radius
): [number, number, number] {
  // Convert to radians
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  // Spherical to Cartesian
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return [x, y, z];
}

/**
 * Convert 3D Cartesian coordinates to lat/lng
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param z - Z coordinate
 * @returns { lat, lng } in degrees
 */
export function cartesianToLatLng(
  x: number,
  y: number,
  z: number
): { lat: number; lng: number } {
  const radius = Math.sqrt(x * x + y * y + z * z);

  const lat = 90 - Math.acos(y / radius) * (180 / Math.PI);
  const lng = Math.atan2(z, -x) * (180 / Math.PI) - 180;

  return { lat, lng };
}

/**
 * Calculate the normal vector at a point on the sphere (for orienting markers)
 *
 * @param lat - Latitude in degrees
 * @param lng - Longitude in degrees
 * @returns Normalized direction vector [x, y, z]
 */
export function getSurfaceNormal(
  lat: number,
  lng: number
): [number, number, number] {
  const pos = latLngToCartesian(lat, lng, 1);
  return pos; // For a unit sphere, position IS the normal
}

/**
 * Calculate great-circle distance between two points on sphere
 * Uses Haversine formula
 *
 * @param lat1 - First point latitude
 * @param lng1 - First point longitude
 * @param lat2 - Second point latitude
 * @param lng2 - Second point longitude
 * @param radius - Sphere radius
 * @returns Distance along sphere surface
 */
export function greatCircleDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  radius: number = GLOBE_CONFIG.radius
): number {
  const toRad = (deg: number) => deg * (Math.PI / 180);

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return radius * c;
}

/**
 * Get a random point on the sphere surface
 *
 * @returns { lat, lng } random coordinates
 */
export function randomSpherePoint(): { lat: number; lng: number } {
  // Use uniform distribution on sphere
  const u = Math.random();
  const v = Math.random();

  const lat = Math.acos(2 * v - 1) * (180 / Math.PI) - 90;
  const lng = u * 360 - 180;

  return { lat, lng };
}

/**
 * Generate N random points distributed across the sphere
 * Uses Fibonacci sphere for even distribution
 *
 * @param count - Number of points to generate
 * @returns Array of { lat, lng } coordinates
 */
export function fibonacciSpherePoints(
  count: number
): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  for (let i = 0; i < count; i++) {
    const theta = (2 * Math.PI * i) / goldenRatio;
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count);

    const lat = 90 - phi * (180 / Math.PI);
    const lng = theta * (180 / Math.PI) - 180;

    points.push({ lat, lng });
  }

  return points;
}

/**
 * Check if a point on the sphere is within impact radius of a meteor strike
 *
 * @param npcLat - NPC latitude
 * @param npcLng - NPC longitude
 * @param impactLat - Impact point latitude
 * @param impactLng - Impact point longitude
 * @param impactRadius - Radius of impact zone on sphere surface
 * @returns true if NPC is within impact zone
 */
export function isWithinImpactRadius(
  npcLat: number,
  npcLng: number,
  impactLat: number,
  impactLng: number,
  impactRadius: number
): boolean {
  const distance = greatCircleDistance(npcLat, npcLng, impactLat, impactLng);
  return distance <= impactRadius;
}

/**
 * Calculate point where a ray from camera intersects the sphere
 *
 * @param rayOrigin - Camera position [x, y, z]
 * @param rayDirection - Normalized ray direction [x, y, z]
 * @param sphereCenter - Center of sphere (usually [0, 0, 0])
 * @param sphereRadius - Radius of sphere
 * @returns Intersection point [x, y, z] or null if no intersection
 */
export function raySphereIntersection(
  rayOrigin: [number, number, number],
  rayDirection: [number, number, number],
  sphereCenter: [number, number, number] = [0, 0, 0],
  sphereRadius: number = GLOBE_CONFIG.radius
): [number, number, number] | null {
  // Vector from ray origin to sphere center
  const oc: [number, number, number] = [
    rayOrigin[0] - sphereCenter[0],
    rayOrigin[1] - sphereCenter[1],
    rayOrigin[2] - sphereCenter[2],
  ];

  // Quadratic coefficients
  const a =
    rayDirection[0] * rayDirection[0] +
    rayDirection[1] * rayDirection[1] +
    rayDirection[2] * rayDirection[2];
  const b =
    2 *
    (oc[0] * rayDirection[0] +
      oc[1] * rayDirection[1] +
      oc[2] * rayDirection[2]);
  const c =
    oc[0] * oc[0] +
    oc[1] * oc[1] +
    oc[2] * oc[2] -
    sphereRadius * sphereRadius;

  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    return null; // No intersection
  }

  // Get nearest intersection
  const t = (-b - Math.sqrt(discriminant)) / (2 * a);

  if (t < 0) {
    return null; // Intersection behind ray
  }

  return [
    rayOrigin[0] + t * rayDirection[0],
    rayOrigin[1] + t * rayDirection[1],
    rayOrigin[2] + t * rayDirection[2],
  ];
}
