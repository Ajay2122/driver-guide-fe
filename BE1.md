# Backend API Update: GPS Tracking & Geocoding Services

## Document Overview
This document specifies the additional backend APIs needed to support:
1. **Geocoding Service** - Convert location names to GPS coordinates
2. **Enhanced GPS Tracking** - Dynamic route creation based on duty status
3. **Distance Calculation** - Calculate miles driven between locations

---

## 1. Geocoding API Endpoints

### 1.1 Geocode Location (Name to Coordinates)
```
POST /api/geocode
```

**Purpose**: Convert a location name (e.g., "Los Angeles") to GPS coordinates.

**Request Body**:
```json
{
  "location": "Los Angeles Terminal",
  "context": {
    "country": "US",
    "state": "CA"
  }
}
```

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "location": "Los Angeles Terminal",
    "coordinates": {
      "lat": 34.0522,
      "lng": -118.2437
    },
    "formattedAddress": "Los Angeles, CA 90001, USA",
    "confidence": "high",
    "source": "google_maps"
  },
  "message": "Location geocoded successfully"
}
```

**Error Response**: `404 Not Found`
```json
{
  "status": "error",
  "message": "Location not found",
  "code": "LOCATION_NOT_FOUND"
}
```

---

### 1.2 Reverse Geocode (Coordinates to Name)
```
POST /api/reverse-geocode
```

**Purpose**: Convert GPS coordinates to a location name.

**Request Body**:
```json
{
  "lat": 34.0522,
  "lng": -118.2437
}
```

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "coordinates": {
      "lat": 34.0522,
      "lng": -118.2437
    },
    "address": "Los Angeles, CA 90001, USA",
    "city": "Los Angeles",
    "state": "CA",
    "country": "USA",
    "zipCode": "90001"
  },
  "message": "Reverse geocoding successful"
}
```

---

### 1.3 Batch Geocode Multiple Locations
```
POST /api/geocode/batch
```

**Purpose**: Geocode multiple locations at once (optimize API calls).

**Request Body**:
```json
{
  "locations": [
    "Los Angeles Terminal",
    "San Francisco Terminal",
    "Bakersfield"
  ]
}
```

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "results": [
      {
        "location": "Los Angeles Terminal",
        "coordinates": { "lat": 34.0522, "lng": -118.2437 },
        "status": "found"
      },
      {
        "location": "San Francisco Terminal",
        "coordinates": { "lat": 37.7749, "lng": -122.4194 },
        "status": "found"
      },
      {
        "location": "Bakersfield",
        "coordinates": { "lat": 35.3733, "lng": -119.0187 },
        "status": "found"
      }
    ],
    "successCount": 3,
    "failureCount": 0
  },
  "message": "Batch geocoding completed"
}
```

---

## 2. Enhanced Daily Log Endpoints (GPS Support)

### 2.1 Update Daily Log Model

**Updated Duty Status Model**:
```json
{
  "status": "enum (off-duty, sleeper, driving, on-duty)",
  "startHour": "integer (0-23)",
  "startMinute": "integer (0-59)",
  "endHour": "integer (0-24)",
  "endMinute": "integer (0-59)",
  "location": "string (name or address)",
  "coordinates": {
    "lat": "float (latitude)",
    "lng": "float (longitude)",
    "timestamp": "datetime (ISO 8601, optional)"
  },
  "autoGeocoded": "boolean (true if automatically geocoded)"
}
```

### 2.2 Create/Update Log with Auto-Geocoding
```
POST /api/logs
PUT /api/logs/{id}
```

**Request Body** (with auto-geocoding flag):
```json
{
  "driverId": "uuid",
  "date": "2024-01-15",
  "dutyStatuses": [
    {
      "status": "off-duty",
      "startHour": 0,
      "startMinute": 0,
      "endHour": 6,
      "endMinute": 0,
      "location": "Home"
    },
    {
      "status": "on-duty",
      "startHour": 6,
      "startMinute": 0,
      "endHour": 7,
      "endMinute": 0,
      "location": "Los Angeles Terminal"
    },
    {
      "status": "driving",
      "startHour": 7,
      "startMinute": 0,
      "endHour": 12,
      "endMinute": 0,
      "location": "Bakersfield",
      "coordinates": {
        "lat": 35.3733,
        "lng": -119.0187
      }
    }
  ],
  "autoGeocode": true
}
```

**Response**: `201 Created`
```json
{
  "status": "success",
  "data": {
    "id": "uuid",
    "driverId": "uuid",
    "date": "2024-01-15",
    "dutyStatuses": [
      {
        "status": "off-duty",
        "startHour": 0,
        "startMinute": 0,
        "endHour": 6,
        "endMinute": 0,
        "location": "Home",
        "coordinates": null
      },
      {
        "status": "on-duty",
        "startHour": 6,
        "startMinute": 0,
        "endHour": 7,
        "endMinute": 0,
        "location": "Los Angeles Terminal",
        "coordinates": {
          "lat": 34.0522,
          "lng": -118.2437,
          "timestamp": "2024-01-15T06:00:00Z"
        },
        "autoGeocoded": true
      },
      {
        "status": "driving",
        "startHour": 7,
        "startMinute": 0,
        "endHour": 12,
        "endMinute": 0,
        "location": "Bakersfield",
        "coordinates": {
          "lat": 35.3733,
          "lng": -119.0187,
          "timestamp": "2024-01-15T07:00:00Z"
        },
        "autoGeocoded": false
      }
    ],
    "totalDrivingDistance": 112.5,
    "routeStats": {
      "totalPoints": 2,
      "drivingSegments": 1,
      "drivingDistance": 112.5
    }
  },
  "message": "Log created successfully with geocoded locations"
}
```

---

## 3. Distance Calculation API

### 3.1 Calculate Distance Between Two Points
```
POST /api/gps/calculate-distance
```

**Request Body**:
```json
{
  "origin": {
    "lat": 34.0522,
    "lng": -118.2437
  },
  "destination": {
    "lat": 35.3733,
    "lng": -119.0187
  },
  "unit": "miles"
}
```

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "distance": 112.5,
    "unit": "miles",
    "origin": {
      "lat": 34.0522,
      "lng": -118.2437
    },
    "destination": {
      "lat": 35.3733,
      "lng": -119.0187
    }
  },
  "message": "Distance calculated successfully"
}
```

---

### 3.2 Calculate Route Distance (Multiple Points)
```
POST /api/gps/calculate-route-distance
```

**Request Body**:
```json
{
  "waypoints": [
    { "lat": 34.0522, "lng": -118.2437 },
    { "lat": 35.3733, "lng": -119.0187 },
    { "lat": 36.7378, "lng": -119.7871 },
    { "lat": 37.7749, "lng": -122.4194 }
  ],
  "unit": "miles"
}
```

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "totalDistance": 382.7,
    "unit": "miles",
    "segments": [
      {
        "from": { "lat": 34.0522, "lng": -118.2437 },
        "to": { "lat": 35.3733, "lng": -119.0187 },
        "distance": 112.5
      },
      {
        "from": { "lat": 35.3733, "lng": -119.0187 },
        "to": { "lat": 36.7378, "lng": -119.7871 },
        "distance": 96.8
      },
      {
        "from": { "lat": 36.7378, "lng": -119.7871 },
        "to": { "lat": 37.7749, "lng": -122.4194 },
        "distance": 173.4
      }
    ],
    "waypointCount": 4
  },
  "message": "Route distance calculated successfully"
}
```

---

## 4. Route Generation Based on Duty Status

### 4.1 Get Route for Daily Log
```
GET /api/logs/{logId}/route
```

**Purpose**: Generate route visualization data with proper filtering based on duty status.

**Query Parameters**:
- `includeDriving` (boolean, default: true): Include driving segments
- `includeOnDuty` (boolean, default: true): Include on-duty locations
- `includeOffDuty` (boolean, default: false): Include off-duty locations
- `includeSleeper` (boolean, default: false): Include sleeper locations

**Response**: `200 OK`
```json
{
  "status": "success",
  "data": {
    "logId": "uuid",
    "date": "2024-01-15",
    "driver": {
      "id": "uuid",
      "name": "John Smith"
    },
    "locations": [
      {
        "status": "on-duty",
        "location": "Los Angeles Terminal",
        "coordinates": {
          "lat": 34.0522,
          "lng": -118.2437
        },
        "time": "06:00",
        "showMarker": true,
        "connectToPrevious": false
      },
      {
        "status": "driving",
        "location": "Bakersfield",
        "coordinates": {
          "lat": 35.3733,
          "lng": -119.0187
        },
        "time": "12:00",
        "showMarker": true,
        "connectToPrevious": true,
        "distanceFromPrevious": 112.5
      },
      {
        "status": "driving",
        "location": "Fresno",
        "coordinates": {
          "lat": 36.7378,
          "lng": -119.7871
        },
        "time": "15:00",
        "showMarker": true,
        "connectToPrevious": true,
        "distanceFromPrevious": 96.8
      }
    ],
    "drivingSegments": [
      {
        "start": { "lat": 34.0522, "lng": -118.2437 },
        "startStatus": "on-duty",
        "end": { "lat": 35.3733, "lng": -119.0187 },
        "endStatus": "driving",
        "distance": 112.5,
        "startTime": "06:00",
        "endTime": "12:00",
        "note": "Started from on-duty location (Terminal), drove to Bakersfield"
      },
      {
        "start": { "lat": 35.3733, "lng": -119.0187 },
        "startStatus": "driving",
        "end": { "lat": 36.7378, "lng": -119.7871 },
        "endStatus": "driving",
        "distance": 96.8,
        "startTime": "12:00",
        "endTime": "15:00",
        "note": "Continued driving from Bakersfield to Fresno"
      }
    ],
    "routeStats": {
      "totalDrivingDistance": 209.3,
      "totalLocations": 3,
      "drivingLocations": 2,
      "onDutyLocations": 1,
      "offDutyLocations": 0,
      "sleeperLocations": 0
    }
  },
  "message": "Route data fetched successfully"
}
```

---

## 5. Implementation Requirements

### 5.1 Geocoding Service Integration

**Option 1: Google Maps Geocoding API** (Recommended)
- **Pros**: High accuracy, comprehensive coverage, reverse geocoding
- **Cons**: Paid service (but has free tier)
- **Setup**: Requires Google Cloud Project + API Key

**Option 2: OpenStreetMap Nominatim**
- **Pros**: Free, open-source
- **Cons**: Rate limiting, less accurate for some locations
- **Setup**: Can self-host or use public API

**Option 3: Mapbox Geocoding API**
- **Pros**: Good accuracy, competitive pricing
- **Cons**: Requires API key, paid service
- **Setup**: Requires Mapbox account

**Recommended Implementation**:
```python
# Python Backend Example using Google Maps

from googlemaps import Client
import os

gmaps = Client(key=os.getenv('GOOGLE_MAPS_API_KEY'))

def geocode_location(location_name: str):
    """Geocode a location name to coordinates"""
    try:
        result = gmaps.geocode(location_name)
        if result:
            location = result[0]['geometry']['location']
            return {
                'lat': location['lat'],
                'lng': location['lng'],
                'formatted_address': result[0]['formatted_address']
            }
        return None
    except Exception as e:
        print(f"Geocoding error: {e}")
        return None

def reverse_geocode(lat: float, lng: float):
    """Reverse geocode coordinates to address"""
    try:
        result = gmaps.reverse_geocode((lat, lng))
        if result:
            return {
                'address': result[0]['formatted_address'],
                'components': result[0]['address_components']
            }
        return None
    except Exception as e:
        print(f"Reverse geocoding error: {e}")
        return None
```

---

### 5.2 Distance Calculation (Haversine Formula)

```python
import math

def calculate_distance(lat1: float, lng1: float, lat2: float, lng2: float, unit: str = 'miles') -> float:
    """
    Calculate distance between two GPS coordinates using Haversine formula
    
    Args:
        lat1, lng1: Origin coordinates
        lat2, lng2: Destination coordinates
        unit: 'miles' or 'kilometers'
    
    Returns:
        Distance in specified unit
    """
    R = 3959 if unit == 'miles' else 6371  # Earth's radius
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lng = math.radians(lng2 - lng1)
    
    a = (math.sin(delta_lat / 2) ** 2 +
         math.cos(lat1_rad) * math.cos(lat2_rad) *
         math.sin(delta_lng / 2) ** 2)
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    
    return round(distance, 1)
```

---

### 5.3 Auto-Geocoding Logic

When creating/updating logs, automatically geocode locations that don't have coordinates:

```python
def process_duty_statuses(duty_statuses: list) -> list:
    """
    Process duty statuses and auto-geocode locations without coordinates
    """
    for status in duty_statuses:
        # If location exists but no coordinates, try to geocode
        if status.get('location') and not status.get('coordinates'):
            coords = geocode_location(status['location'])
            if coords:
                status['coordinates'] = coords
                status['autoGeocoded'] = True
            else:
                status['autoGeocoded'] = False
    
    return duty_statuses
```

---

### 5.4 Route Statistics Calculation

```python
def calculate_route_stats(duty_statuses: list) -> dict:
    """
    Calculate route statistics from duty statuses
    
    IMPORTANT: Lines are drawn from LAST KNOWN LOCATION (any status) to DRIVING location.
    This represents the actual distance driven from where the driver was to where they drove to.
    
    Example:
    - On-Duty at Terminal (inspection) → coordinates saved
    - Driving to City → LINE DRAWN from Terminal to City with distance
    
    This accurately reflects real-world scenarios where a driver:
    1. Does pre-trip inspection at a location (on-duty, not driving)
    2. Then drives from that location to their destination
    """
    stats = {
        'totalDrivingDistance': 0,
        'totalLocations': 0,
        'drivingLocations': 0,
        'onDutyLocations': 0,
        'offDutyLocations': 0,
        'sleeperLocations': 0,
        'drivingSegments': []
    }
    
    last_known_coord = None  # Track LAST KNOWN location (any status)
    last_known_status = None
    
    for status in duty_statuses:
        if status.get('coordinates'):
            stats['totalLocations'] += 1
            
            # Count by status type
            if status['status'] == 'driving':
                stats['drivingLocations'] += 1
                
                # Calculate distance from LAST KNOWN location (not just last driving)
                if last_known_coord:
                    distance = calculate_distance(
                        last_known_coord['lat'],
                        last_known_coord['lng'],
                        status['coordinates']['lat'],
                        status['coordinates']['lng']
                    )
                    stats['totalDrivingDistance'] += distance
                    stats['drivingSegments'].append({
                        'start': last_known_coord,
                        'end': status['coordinates'],
                        'distance': distance,
                        'startStatus': last_known_status
                    })
            elif status['status'] == 'on-duty':
                stats['onDutyLocations'] += 1
            elif status['status'] == 'off-duty':
                stats['offDutyLocations'] += 1
            elif status['status'] == 'sleeper':
                stats['sleeperLocations'] += 1
            
            # Update last known location (for ANY status type)
            last_known_coord = status['coordinates']
            last_known_status = status['status']
    
    stats['totalDrivingDistance'] = round(stats['totalDrivingDistance'], 1)
    return stats
```

---

## 6. Database Schema Updates

### 6.1 Update duty_statuses JSON Column

```sql
-- Existing structure
{
  "status": "driving",
  "startHour": 7,
  "startMinute": 0,
  "endHour": 12,
  "endMinute": 0,
  "location": "Bakersfield"
}

-- Updated structure
{
  "status": "driving",
  "startHour": 7,
  "startMinute": 0,
  "endHour": 12,
  "endMinute": 0,
  "location": "Bakersfield",
  "coordinates": {
    "lat": 35.3733,
    "lng": -119.0187,
    "timestamp": "2024-01-15T07:00:00Z"
  },
  "autoGeocoded": true
}
```

### 6.2 Add Route Stats to daily_logs Table

```sql
ALTER TABLE daily_logs
ADD COLUMN total_driving_distance DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN route_stats JSONB;

-- Example route_stats JSON
{
  "totalLocations": 5,
  "drivingLocations": 3,
  "onDutyLocations": 1,
  "offDutyLocations": 1,
  "sleeperLocations": 0,
  "drivingSegments": 2
}
```

---

## 7. Environment Variables

```bash
# Geocoding Service
GOOGLE_MAPS_API_KEY=your_api_key_here
GEOCODING_PROVIDER=google_maps  # or openstreetmap, mapbox
GEOCODING_CACHE_ENABLED=true
GEOCODING_CACHE_TTL=86400  # 24 hours

# Distance Calculation
DISTANCE_UNIT_DEFAULT=miles
DISTANCE_PRECISION=1  # decimal places

# Auto-Geocoding
AUTO_GEOCODE_ENABLED=true
AUTO_GEOCODE_ON_CREATE=true
AUTO_GEOCODE_ON_UPDATE=true
GEOCODE_BATCH_SIZE=10
```

---

## 8. API Usage Examples

### 8.1 Create Log with Mixed Location Types

```bash
curl -X POST http://localhost:8000/api/logs \
  -H "Content-Type: application/json" \
  -d '{
    "driverId": "123e4567-e89b-12d3-a456-426614174000",
    "date": "2024-01-15",
    "autoGeocode": true,
    "dutyStatuses": [
      {
        "status": "off-duty",
        "startHour": 0,
        "startMinute": 0,
        "endHour": 6,
        "endMinute": 0
      },
      {
        "status": "on-duty",
        "startHour": 6,
        "startMinute": 0,
        "endHour": 7,
        "endMinute": 0,
        "location": "Los Angeles Terminal"
      },
      {
        "status": "driving",
        "startHour": 7,
        "startMinute": 0,
        "endHour": 12,
        "endMinute": 0,
        "location": "Bakersfield",
        "coordinates": {
          "lat": 35.3733,
          "lng": -119.0187
        }
      },
      {
        "status": "driving",
        "startHour": 12,
        "startMinute": 30,
        "endHour": 15,
        "endMinute": 0,
        "location": "Fresno"
      }
    ]
  }'
```

---

## 9. Testing Requirements

### 9.1 Geocoding Tests
- Test valid location names
- Test invalid/unknown locations
- Test coordinate parsing
- Test batch geocoding
- Test caching mechanism

### 9.2 Distance Calculation Tests
- Test Haversine formula accuracy
- Test edge cases (poles, date line)
- Test different units (miles/km)
- Test zero distance

### 9.3 Route Generation Tests
- Test driving segments only
- Test mixed duty statuses
- Test consecutive driving locations
- Test non-consecutive driving locations

---

## 10. Cost Estimation

### Google Maps Geocoding API Pricing (as of 2024)
- **Geocoding**: $5 per 1,000 requests (first $200/month free)
- **Reverse Geocoding**: $5 per 1,000 requests
- **Free Tier**: $200 credit/month = ~40,000 requests/month

### Estimated Usage
- **Drivers**: 100
- **Logs per day**: 100
- **Locations per log**: 5 (average)
- **Monthly requests**: 100 drivers × 30 days × 5 locations = 15,000 requests
- **Monthly cost**: Well within free tier

---

## Summary

### What Frontend Sends:
1. **Location name** (e.g., "Los Angeles") OR
2. **GPS coordinates** (e.g., "34.0522, -118.2437") OR
3. **Both**

### What Backend Returns:
1. **Geocoded coordinates** (if name was provided)
2. **Calculated distances** for driving segments
3. **Route statistics** (total distance, segment count, etc.)

### Backend Changes Needed:
1. ✅ **Add geocoding endpoint** (`POST /api/geocode`)
2. ✅ **Update log create/update** endpoints to auto-geocode
3. ✅ **Add distance calculation** functions
4. ✅ **Add route generation** endpoint
5. ✅ **Update database schema** to store coordinates
6. ✅ **Add route statistics** calculation

### Frontend Benefits:
- User can enter location **name** or **coordinates**
- Backend handles geocoding automatically
- Map shows **lines only for driving** segments
- Distance calculated and displayed automatically

