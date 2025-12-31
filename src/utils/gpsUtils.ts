import { GPSCoordinate } from '../types';

export function calculateDistance(coord1: GPSCoordinate, coord2: GPSCoordinate): number {
  const R = 3959;
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function parseCoordinates(coordString: string): GPSCoordinate | null {
  const parts = coordString.split(',').map(p => p.trim());
  if (parts.length !== 2) return null;
  
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  
  if (isNaN(lat) || isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  
  return { lat, lng };
}

export function formatCoordinate(coord: GPSCoordinate): string {
  return `${coord.lat.toFixed(4)}, ${coord.lng.toFixed(4)}`;
}
