import { GPSCoordinate } from '../types';

// Mock geocoding service - In production, use Google Maps Geocoding API or similar
export const geocodeLocation = async (locationName: string): Promise<GPSCoordinate | null> => {
  // Mock database of common locations
  const locationDatabase: { [key: string]: GPSCoordinate } = {
    // Terminals
    'terminal': { lat: 34.0522, lng: -118.2437 },
    'los angeles terminal': { lat: 34.0522, lng: -118.2437 },
    'san francisco terminal': { lat: 37.7749, lng: -122.4194 },
    'houston terminal': { lat: 29.7604, lng: -95.3698 },
    'dallas terminal': { lat: 32.7767, lng: -96.7970 },
    'chicago terminal': { lat: 41.8781, lng: -87.6298 },
    
    // Cities
    'los angeles': { lat: 34.0522, lng: -118.2437 },
    'san francisco': { lat: 37.7749, lng: -122.4194 },
    'sacramento': { lat: 38.5816, lng: -121.4944 },
    'bakersfield': { lat: 35.3733, lng: -119.0187 },
    'fresno': { lat: 36.7378, lng: -119.7871 },
    'santa clarita': { lat: 34.3917, lng: -118.5426 },
    'houston': { lat: 29.7604, lng: -95.3698 },
    'dallas': { lat: 32.7767, lng: -96.7970 },
    'austin': { lat: 30.2672, lng: -97.7431 },
    'san antonio': { lat: 29.4241, lng: -98.4936 },
    'chicago': { lat: 41.8781, lng: -87.6298 },
    'st. louis': { lat: 38.6270, lng: -90.1994 },
    'springfield': { lat: 39.7817, lng: -89.6501 },
    'joliet': { lat: 41.5250, lng: -88.0817 },
    
    // Rest stops and highways
    'i-5 north': { lat: 35.3733, lng: -119.0187 },
    'i-10 west': { lat: 30.2672, lng: -97.7431 },
    'i-45 north': { lat: 30.6280, lng: -96.3344 },
    'i-55 south': { lat: 39.8045, lng: -89.6440 },
    'i-40 east': { lat: 35.2087, lng: -89.9711 },
    'route 66': { lat: 35.5182, lng: -97.4409 },
    'highway 101': { lat: 36.5946, lng: -121.8812 },
    'rest stop': { lat: 35.5, lng: -119.5 },
    'fuel stop': { lat: 36.0, lng: -120.0 },
    'truck stop': { lat: 36.5, lng: -120.5 },
    
    // Delivery/Loading locations
    'warehouse': { lat: 34.0500, lng: -118.2500 },
    'distribution center': { lat: 34.0000, lng: -118.3000 },
    'loading dock': { lat: 34.1000, lng: -118.2000 },
    'delivery point': { lat: 37.7500, lng: -122.4000 },
  };

  const normalizedName = locationName.toLowerCase().trim();
  
  // Check if exact match exists
  if (locationDatabase[normalizedName]) {
    return locationDatabase[normalizedName];
  }
  
  // Check for partial matches
  for (const [key, coords] of Object.entries(locationDatabase)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return coords;
    }
  }
  
  // If no match found, return null
  // In production, this would call an actual geocoding API
  return null;
};

// Calculate distance between two coordinates using Haversine formula
export const calculateDistance = (coord1: GPSCoordinate, coord2: GPSCoordinate): number => {
  const R = 3959; // Earth's radius in miles
  const lat1 = coord1.lat * Math.PI / 180;
  const lat2 = coord2.lat * Math.PI / 180;
  const deltaLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const deltaLng = (coord2.lng - coord1.lng) * Math.PI / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

// Parse coordinate string (e.g., "34.0522, -118.2437")
export const parseCoordinates = (input: string): GPSCoordinate | null => {
  const parts = input.split(',').map(p => p.trim());
  if (parts.length === 2) {
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (!isNaN(lat) && !isNaN(lng)) {
      if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        return { lat, lng };
      }
    }
  }
  return null;
};

// Main function to get coordinates from user input (either name or coordinates)
export const getCoordinatesFromInput = async (input: string): Promise<GPSCoordinate | null> => {
  if (!input || input.trim() === '') {
    return null;
  }

  // First, try to parse as coordinates
  const parsedCoords = parseCoordinates(input);
  if (parsedCoords) {
    return parsedCoords;
  }

  // If not coordinates, try geocoding the location name
  return await geocodeLocation(input);
};

// Calculate route statistics from duty statuses (for mock/fallback)
export const calculate_route_stats = (dutyStatuses: any[]): any => {
  const stats: any = {
    totalDrivingDistance: 0,
    totalLocations: 0,
    drivingLocations: 0,
    drivingSegments: []
  };

  let lastKnownCoord: GPSCoordinate | null = null;
  let lastKnownStatus: string | null = null;

  dutyStatuses.forEach((status) => {
    const coordinates = status.coordinates;
    
    if (coordinates && coordinates.lat && coordinates.lng) {
      stats.totalLocations += 1;
      
      // If current status is DRIVING and we have a previous location
      if (status.status === 'driving' && lastKnownCoord) {
        const distance = calculateDistance(lastKnownCoord, coordinates);
        stats.totalDrivingDistance += distance;
        stats.drivingSegments.push({
          start: lastKnownCoord,
          startStatus: lastKnownStatus,
          end: coordinates,
          endStatus: 'driving',
          distance
        });
      }
      
      if (status.status === 'driving') {
        stats.drivingLocations += 1;
      }
      
      // Update last known location (for ANY status type)
      lastKnownCoord = coordinates;
      lastKnownStatus = status.status;
    }
  });

  stats.totalDrivingDistance = Math.round(stats.totalDrivingDistance * 10) / 10;
  return stats;
};

// Export alias for backward compatibility
export const geocode_location = geocodeLocation;
