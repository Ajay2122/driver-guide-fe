import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DutyStatus, GPSCoordinate } from '../types';
import { calculateDistance } from '../services/geocoding';
import './RouteMap.css';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface RouteMapProps {
  dutyStatuses: DutyStatus[];
  driverName?: string;
  date?: string;
}

// Custom marker icons for different duty statuses
const createCustomIcon = (color: string, emoji: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 35px;
        height: 35px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">${emoji}</div>
    `,
    iconSize: [35, 35],
    iconAnchor: [17, 17],
  });
};

const statusIcons = {
  'off-duty': createCustomIcon('#4CAF50', '🏠'),
  'sleeper': createCustomIcon('#2196F3', '🛌'),
  'driving': createCustomIcon('#FF6600', '🚛'),
  'on-duty': createCustomIcon('#FFC107', '⚙️'),
};

// Component to fit bounds automatically
const FitBounds: React.FC<{ coordinates: GPSCoordinate[] }> = ({ coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates.map(coord => [coord.lat, coord.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coordinates, map]);

  return null;
};

const RouteMap: React.FC<RouteMapProps> = ({ dutyStatuses, driverName, date }) => {
  // Filter duty statuses that have coordinates
  const statusesWithCoords = dutyStatuses.filter(status => status.coordinates);

  // Create driving segments - connect from LAST KNOWN LOCATION to DRIVING location
  const drivingSegments: { start: GPSCoordinate; end: GPSCoordinate; distance: number; startStatus: string }[] = [];
  let lastKnownCoord: GPSCoordinate | null = null;
  let lastKnownStatus: string | null = null;

  statusesWithCoords.forEach((status) => {
    if (status.coordinates) {
      // If current status is DRIVING and we have a previous location
      if (status.status === 'driving' && lastKnownCoord) {
        const distance = calculateDistance(lastKnownCoord, status.coordinates);
        drivingSegments.push({
          start: lastKnownCoord,
          end: status.coordinates,
          distance,
          startStatus: lastKnownStatus || ''
        });
      }
      
      // Update last known location (for any status type)
      lastKnownCoord = status.coordinates;
      lastKnownStatus = status.status;
    }
  });

  // Calculate total driving distance
  const totalDistance = drivingSegments.reduce((sum, seg) => sum + seg.distance, 0);

  // Default center (US center)
  const defaultCenter: [number, number] = [39.8283, -98.5795];
  const center: [number, number] = statusesWithCoords.length > 0
    ? [statusesWithCoords[0].coordinates!.lat, statusesWithCoords[0].coordinates!.lng]
    : defaultCenter;

  if (statusesWithCoords.length === 0) {
    return (
      <div className="no-route-data">
        <div className="no-route-icon">🗺️</div>
        <h3>No Route Data Available</h3>
        <p>GPS coordinates not recorded for this log</p>
      </div>
    );
  }

  return (
    <div className="route-map-container">
      <div className="route-map-header">
        <h3>🗺️ Route Map</h3>
        <div className="route-header-info">
          {driverName && <p className="route-info">Driver: {driverName}</p>}
          {date && <p className="route-info">Date: {date}</p>}
          {totalDistance > 0 && (
            <p className="route-info total-distance">
              <strong>Total Driving Distance: {totalDistance.toFixed(1)} miles</strong>
            </p>
          )}
        </div>
      </div>
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: '500px', width: '100%', borderRadius: '8px' }}
        className="route-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Driving route polylines with distance labels */}
        {drivingSegments.map((segment, index) => (
          <React.Fragment key={`segment-${index}`}>
            <Polyline
              positions={[
                [segment.start.lat, segment.start.lng],
                [segment.end.lat, segment.end.lng]
              ]}
              color="#FF6600"
              weight={4}
              opacity={0.8}
            >
              <Tooltip permanent direction="center" className="distance-tooltip">
                {segment.distance.toFixed(1)} mi
              </Tooltip>
            </Polyline>
          </React.Fragment>
        ))}

        {/* Markers for each duty status location */}
        {statusesWithCoords.map((status, index) => {
          const coord = status.coordinates!;
          
          // Find if this is the start of a driving segment
          const isStartOfDriving = drivingSegments.find(seg => 
            seg.start.lat === coord.lat && seg.start.lng === coord.lng
          );
          
          // Find if this is the end of a driving segment (the driving location itself)
          const drivingSegmentToHere = drivingSegments.find(seg =>
            seg.end.lat === coord.lat && seg.end.lng === coord.lng
          );
          
          return (
            <Marker
              key={index}
              position={[coord.lat, coord.lng]}
              icon={statusIcons[status.status]}
            >
              <Popup>
                <div className="marker-popup">
                  <strong>
                    {status.status === 'off-duty' && '🏠 Off Duty'}
                    {status.status === 'sleeper' && '🛌 Sleeper Berth'}
                    {status.status === 'driving' && '🚛 Driving'}
                    {status.status === 'on-duty' && '⚙️ On-Duty (Not Driving)'}
                  </strong>
                  <p>
                    Time: {String(status.startHour).padStart(2, '0')}:
                    {String(status.startMinute).padStart(2, '0')} - 
                    {String(status.endHour).padStart(2, '0')}:
                    {String(status.endMinute).padStart(2, '0')}
                  </p>
                  {status.location && <p>📍 {status.location}</p>}
                  <p className="coordinates">
                    GPS: {coord.lat.toFixed(4)}, {coord.lng.toFixed(4)}
                  </p>
                  {drivingSegmentToHere && (
                    <p className="distance-info">
                      🛣️ Drove {drivingSegmentToHere.distance.toFixed(1)} miles to reach here
                    </p>
                  )}
                  {isStartOfDriving && status.status !== 'driving' && (
                    <p className="status-note">
                      (Starting location for next drive)
                    </p>
                  )}
                  {status.status === 'on-duty' && (
                    <p className="status-note">
                      (Vehicle inspection, loading, etc.)
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Fit bounds to show all markers */}
        <FitBounds coordinates={statusesWithCoords.map(s => s.coordinates!)} />
      </MapContainer>

      <div className="route-legend">
        <div className="legend-title">Map Legend:</div>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-marker" style={{ background: '#4CAF50' }}>🏠</span>
            <span>Off Duty (rest location)</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker" style={{ background: '#2196F3' }}>🛌</span>
            <span>Sleeper Berth (sleep location)</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker" style={{ background: '#FF6600' }}>🚛</span>
            <span>Driving (with distance lines)</span>
          </div>
          <div className="legend-item">
            <span className="legend-marker" style={{ background: '#FFC107' }}>⚙️</span>
            <span>On-Duty (inspection, loading)</span>
          </div>
        </div>
        <div className="legend-note">
          <strong>How it works:</strong> Orange lines show actual driving distance. When a driver starts 
          DRIVING, a line is drawn from their last known location (any status) to the driving destination. 
          Example: On-Duty at Terminal → Driving to City = Line shows miles driven from Terminal to City.
        </div>
      </div>
    </div>
  );
};

export default RouteMap;

